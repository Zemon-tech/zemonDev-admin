import { Request } from 'express';

export interface FileValidationRules {
  maxSizeBytes: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
}

export const DEFAULT_IMAGE_VALIDATION_RULES: FileValidationRules = {
  maxSizeBytes: 512000, // 500KB
  allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
};

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export class FileValidator {
  private rules: FileValidationRules;

  constructor(rules: FileValidationRules = DEFAULT_IMAGE_VALIDATION_RULES) {
    this.rules = rules;
  }

  /**
   * Validate file size
   */
  validateFileSize(file: Express.Multer.File): FileValidationResult {
    if (file.size > this.rules.maxSizeBytes) {
      return {
        isValid: false,
        error: `Image size must be under ${Math.round(this.rules.maxSizeBytes / 1024)}KB`
      };
    }
    return { isValid: true };
  }

  /**
   * Validate file MIME type
   */
  validateMimeType(file: Express.Multer.File): FileValidationResult {
    if (!this.rules.allowedMimeTypes.includes(file.mimetype)) {
      return {
        isValid: false,
        error: 'Please select a valid image file (JPG, PNG, GIF, WebP)'
      };
    }
    return { isValid: true };
  }

  /**
   * Validate file extension
   */
  validateFileExtension(file: Express.Multer.File): FileValidationResult {
    const extension = this.getFileExtension(file.originalname);
    if (!this.rules.allowedExtensions.includes(extension)) {
      return {
        isValid: false,
        error: 'Please select a valid image file (JPG, PNG, GIF, WebP)'
      };
    }
    return { isValid: true };
  }

  /**
   * Comprehensive file validation
   */
  validateFile(file: Express.Multer.File): FileValidationResult {
    // Check file size
    const sizeValidation = this.validateFileSize(file);
    if (!sizeValidation.isValid) {
      return sizeValidation;
    }

    // Check MIME type
    const mimeValidation = this.validateMimeType(file);
    if (!mimeValidation.isValid) {
      return mimeValidation;
    }

    // Check file extension
    const extensionValidation = this.validateFileExtension(file);
    if (!extensionValidation.isValid) {
      return extensionValidation;
    }

    return { isValid: true };
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    return filename.toLowerCase().substring(filename.lastIndexOf('.'));
  }

  /**
   * Generate unique filename with original extension
   */
  generateUniqueFilename(originalName: string): string {
    const extension = this.getFileExtension(originalName);
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${randomString}${extension}`;
  }
}

/**
 * Multer file filter function for image validation
 */
export const imageFileFilter = (_req: Request, file: Express.Multer.File, cb: any) => {
  const validator = new FileValidator();
  const validation = validator.validateMimeType(file);
  
  if (validation.isValid) {
    cb(null, true);
  } else {
    cb(new Error(validation.error), false);
  }
};