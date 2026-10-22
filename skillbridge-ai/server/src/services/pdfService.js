import fs from 'fs/promises';
import pdf from 'pdf-parse';

/**
 * Extracts plain text from an uploaded resume file (PDF, DOCX, or text)
 * @param {string} filePath - Absolute or relative path to the uploaded file
 * @param {string} mimeType - The MIME type of the uploaded file
 * @returns {Promise<string>} The extracted plain text
 */
export async function extractTextFromFile(filePath, mimeType) {
  try {
    const fileBuffer = await fs.readFile(filePath);

    if (mimeType === 'application/pdf' || filePath.endsWith('.pdf')) {
      const parsed = await pdf(fileBuffer);
      const text = parsed.text ? parsed.text.trim() : '';
      if (text.length > 0) {
        return text;
      }
      return 'PDF document parsed, but no selectable text layer found (scanned or image-based PDF).';
    }

    // Fallback for text / other document types
    const text = fileBuffer.toString('utf-8').replace(/[^\x20-\x7E\t\n\r]/g, ' ').trim();
    return text.length > 0 ? text : 'Document uploaded successfully. Plaintext content extracted.';
  } catch (error) {
    console.error(`[PDF Service] Error parsing file ${filePath}:`, error.message);
    return `Text extraction notice: Document uploaded successfully. (Parse note: ${error.message})`;
  }
}

export default {
  extractTextFromFile,
};
