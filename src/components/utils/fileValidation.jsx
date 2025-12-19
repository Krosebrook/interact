/**
 * FILE UPLOAD VALIDATION UTILITIES
 * Enforces 10MB max size and image/PDF only per security requirements
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf'
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];

/**
 * Validate a single file
 * @throws {Error} if validation fails
 */
export function validateFile(file) {
  if (!file) {
    throw new Error('No file provided');
  }

  // Size check
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`File size (${sizeMB}MB) exceeds maximum allowed size of 10MB`);
  }

  // Type check
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP) and PDFs are allowed');
  }

  // Extension check (additional security)
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    throw new Error(`Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
  }

  return true;
}

/**
 * Validate multiple files
 * @throws {Error} if any validation fails
 */
export function validateFiles(files) {
  if (!files || files.length === 0) {
    throw new Error('No files provided');
  }

  files.forEach((file, index) => {
    try {
      validateFile(file);
    } catch (error) {
      throw new Error(`File ${index + 1} (${file.name}): ${error.message}`);
    }
  });

  return true;
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if file is an image
 */
export function isImage(file) {
  return file.type.startsWith('image/');
}

/**
 * Check if file is a PDF
 */
export function isPDF(file) {
  return file.type === 'application/pdf';
}