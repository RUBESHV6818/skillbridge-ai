const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function extractTextFromFile(file) {
  if (!file) return '';
  const { mimetype, path: filePath } = file;

  if (mimetype === 'application/pdf') {
    const data = await fs.promises.readFile(filePath);
    const parsed = await pdfParse(data);
    const text = (parsed.text || '').trim();
    if (!text) {
      throw new Error('This PDF has no selectable text. Please upload a text-based PDF; scanned PDFs need OCR first.');
    }
    return text;
  }

  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ path: filePath });
    const text = (result.value || '').trim();
    if (!text) throw new Error('No readable text was found in this DOCX file.');
    return text;
  }

  throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
}

module.exports = { extractTextFromFile };
