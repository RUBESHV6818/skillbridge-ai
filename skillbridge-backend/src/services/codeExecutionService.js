const DEFAULT_BASE_URL = 'https://emkc.org/api/v2/piston';
const LANGUAGE_MAP = {
  Python: { apiName: 'python', fileName: 'main.py' },
  Java: { apiName: 'java', fileName: 'Main.java' },
};
const runtimesCache = { expiresAt: 0, runtimes: [] };

async function getRuntimes(baseUrl) {
  if (runtimesCache.expiresAt > Date.now()) return runtimesCache.runtimes;
  const response = await fetch(`${baseUrl}/runtimes`, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`Code runner could not list runtimes (HTTP ${response.status}).`);
  const runtimes = await response.json();
  if (!Array.isArray(runtimes)) throw new Error('Code runner returned an invalid runtime list.');
  runtimesCache.runtimes = runtimes;
  runtimesCache.expiresAt = Date.now() + 30 * 60 * 1000;
  return runtimes;
}

function findRuntime(runtimes, language) {
  const expected = LANGUAGE_MAP[language]?.apiName;
  const candidates = runtimes.filter((runtime) => runtime.language === expected || (runtime.aliases || []).includes(expected));
  candidates.sort((a, b) => String(b.version).localeCompare(String(a.version), undefined, { numeric: true }));
  return candidates[0];
}

async function runOne({ baseUrl, runtime, fileName, code, input }) {
  const response = await fetch(`${baseUrl}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: runtime.language,
      version: runtime.version,
      files: [{ name: fileName, content: code }],
      stdin: input,
      compile_timeout: 10000,
      run_timeout: 3000,
      compile_memory_limit: 128000000,
      run_memory_limit: 128000000,
    }),
    signal: AbortSignal.timeout(20000),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || `Code runner failed (HTTP ${response.status}).`);
  if (body.compile && body.compile.code !== 0) return { compileError: `${body.compile.stderr || body.compile.output || 'Compilation failed.'}`.slice(0, 1500) };
  if (body.run?.signal) return { runtimeError: `Program stopped (${body.run.signal}).` };
  if (body.run?.code !== 0) return { runtimeError: `${body.run?.stderr || body.run?.output || 'Program exited with an error.'}`.slice(0, 1500) };
  return { output: String(body.run?.stdout || '').trim() };
}

async function runSampleCases({ language, code, sampleTestCases }) {
  if (!LANGUAGE_MAP[language]) throw Object.assign(new Error('Choose Java or Python to use the online sample runner.'), { statusCode: 400 });
  if (typeof code !== 'string' || !code.trim() || Buffer.byteLength(code, 'utf8') > 20000) {
    throw Object.assign(new Error('Enter a solution under 20 KB before running it.'), { statusCode: 400 });
  }
  if (!Array.isArray(sampleTestCases) || sampleTestCases.length < 1 || sampleTestCases.length > 4) {
    throw Object.assign(new Error('This challenge does not have a valid sample test set.'), { statusCode: 422 });
  }
  if (sampleTestCases.some((test) => Buffer.byteLength(String(test.input || ''), 'utf8') > 10000 || Buffer.byteLength(String(test.expectedOutput || ''), 'utf8') > 10000)) {
    throw Object.assign(new Error('The sample input or expected output exceeds the execution limit.'), { statusCode: 422 });
  }
  const baseUrl = String(process.env.PISTON_API_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
  const runtimes = await getRuntimes(baseUrl);
  const runtime = findRuntime(runtimes, language);
  if (!runtime) throw Object.assign(new Error(`The online code runner currently has no ${language} runtime.`), { statusCode: 503 });
  const { fileName } = LANGUAGE_MAP[language];
  const results = [];
  for (let index = 0; index < sampleTestCases.length; index += 1) {
    const test = sampleTestCases[index];
    const result = await runOne({ baseUrl, runtime, fileName, code, input: String(test.input || '') });
    if (result.compileError) return { language, runtime: runtime.version, results: [], compileError: result.compileError };
    if (result.runtimeError) return { language, runtime: runtime.version, results: [{ index: index + 1, pass: false, expected: String(test.expectedOutput || '').trim(), actual: result.runtimeError }], runtimeError: result.runtimeError };
    const expected = String(test.expectedOutput || '').replace(/\r\n/g, '\n').trim();
    const actual = result.output.replace(/\r\n/g, '\n').trim();
    results.push({ index: index + 1, pass: actual === expected, expected, actual });
    // Respect the public Piston service's published request-rate limit.
    if (index < sampleTestCases.length - 1) await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return { language, runtime: runtime.version, results };
}

module.exports = { runSampleCases };
