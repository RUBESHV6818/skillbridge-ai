const test = require('node:test');
const assert = require('node:assert/strict');
const { validateResumeFileBuffer } = require('../src/services/resumeFileValidation');

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

test('accepts a PDF signature near the start of a PDF file', () => {
  const pdf = Buffer.from('%PDF-1.7\nresume content');
  assert.equal(validateResumeFileBuffer(pdf, 'resume.pdf', 'application/pdf'), true);
});

test('rejects a renamed text file claiming to be a PDF', () => {
  assert.throws(
    () => validateResumeFileBuffer(Buffer.from('not a PDF'), 'resume.pdf', 'application/pdf'),
    /not a valid PDF/,
  );
});

test('accepts a DOCX ZIP signature', () => {
  const zip = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00]);
  assert.equal(validateResumeFileBuffer(zip, 'resume.docx', DOCX_MIME), true);
});

test('rejects a file with a mismatched extension and MIME type', () => {
  assert.throws(
    () => validateResumeFileBuffer(Buffer.from('%PDF-1.7'), 'resume.docx', DOCX_MIME),
    /not a valid DOCX/,
  );
});
