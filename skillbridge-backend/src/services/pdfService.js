// src/services/pdfService.js
const fs = require('fs');
const pdfParse = require('pdf-parse');

/**
 * Extract text from a file buffer.
 * Supports PDF via pdf-parse. For other types (DOCX), returns buffer as UTF-8 string (placeholder).
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} extracted text
 */
async function extractTextFromFile(file) {
  if (!file) return '';
  const { mimetype, path: filePath } = file;
  if (mimetype === 'application/pdf') {
    const data = await fs.promises.readFile(filePath);
    const parsed = await pdfParse(data);
    return parsed.text || '';
  }
  // Simple fallback for DOCX or others: read as UTF-8 (not true parsing but placeholder)
  const data = await fs.promises.readFile(filePath, 'utf8');
  return data;
}

module.exports = { extractTextFromFile };
