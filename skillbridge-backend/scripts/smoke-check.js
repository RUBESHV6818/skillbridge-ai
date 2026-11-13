const apiBase = String(process.env.SMOKE_API_URL || 'http://localhost:5001').replace(/\/$/, '');
const webOrigin = String(process.env.SMOKE_WEB_ORIGIN || 'http://localhost:5173').replace(/\/$/, '');

async function expectStatus(url, expectedStatus, options = {}) {
  const response = await fetch(url, { signal: AbortSignal.timeout(8000), ...options });
  if (response.status !== expectedStatus) {
    throw new Error(`${url} returned HTTP ${response.status}; expected ${expectedStatus}.`);
  }
  return response;
}

async function runSmokeCheck() {
  const frontend = await expectStatus(webOrigin, 200);
  console.log(`PASS frontend responds (${frontend.status})`);

  const live = await expectStatus(`${apiBase}/health/live`, 200);
  const liveBody = await live.json();
  if (liveBody.status !== 'ok') throw new Error('Backend liveness check returned an unexpected response.');
  console.log('PASS backend is live');

  const ready = await expectStatus(`${apiBase}/health/ready`, 200);
  const readyBody = await ready.json();
  if (readyBody.status !== 'ready' || readyBody.database !== 'connected') {
    throw new Error('Backend readiness check did not confirm the database connection.');
  }
  console.log('PASS database is ready');

  const allowedOriginCheck = await expectStatus(`${apiBase}/api/resumes`, 401, {
    headers: { Origin: webOrigin },
  });
  if (allowedOriginCheck.headers.get('access-control-allow-origin') !== webOrigin) {
    throw new Error('The configured frontend origin is not allowed by backend CORS.');
  }
  console.log('PASS configured frontend origin is allowed');

  const untrustedOriginCheck = await fetch(`${apiBase}/api/resumes`, {
    headers: { Origin: 'https://not-allowed.invalid' },
    signal: AbortSignal.timeout(8000),
  });
  if (untrustedOriginCheck.headers.has('access-control-allow-origin')) {
    throw new Error('Backend CORS unexpectedly allowed an untrusted origin.');
  }
  console.log('PASS untrusted origin is not allowed');
}

runSmokeCheck().catch((error) => {
  console.error(`Smoke check failed: ${error.message}`);
  process.exitCode = 1;
});
