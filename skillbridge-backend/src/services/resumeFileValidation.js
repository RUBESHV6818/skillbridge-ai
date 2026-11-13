const path = require('path');

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function validateResumeFileBuffer(buffer, fileName, mimeType) {
  const extension = path.extname(fileName || '').toLowerCase();
  if (!Buffer.isBuffer(buffer)) throw new Error('The uploaded file could not be read.');

  if (extension === '.pdf' && mimeType === 'application/pdf') {
    // PDF headers should occur near the beginning of the file (allowing a small preamble).
    if (buffer.subarray(0, 1024).includes(Buffer.from('%PDF-'))) return true;
    throw new Error('This file is not a valid PDF. Please choose a readable PDF document.');
  }

  if (extension === '.docx' && mimeType === DOCX_MIME) {
    // DOCX is an Office Open XML ZIP archive.
    if (buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b
      && [0x03, 0x05, 0x07].includes(buffer[2]) && [0x04, 0x06, 0x08].includes(buffer[3])) return true;
    throw new Error('This file is not a valid DOCX document. Please choose a readable DOCX file.');
  }

  throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
}

module.exports = { validateResumeFileBuffer };
