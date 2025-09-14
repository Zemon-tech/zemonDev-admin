import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { imageFileFilter, FileValidator, DEFAULT_IMAGE_VALIDATION_RULES } from '../utils/fileValidation';

/**
 * Multer configuration for image uploads
 * Uses memory storage for temporary file handling
 */
const storage = multer.memoryStorage();

/**
 * Multer upload configuration for single image uploads
 */
export const uploadSingleImage = multer({
  storage: storage,
  limits: {
    fileSize: DEFAULT_IMAGE_VALIDATION_RULES.maxSizeBytes, // 500KB limit
    files: 1 // Only allow single file upload
  },
  fileFilter: imageFileFilter
}).single('image');

/**
 * Enhanced upload middleware with comprehensive validation
 */
export const uploadImageMiddleware = (req: Request, res: Response, next: NextFunction) => {
  uploadSingleImage(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      // Handle Multer-specific errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'Image size must be under 500KB'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: 'Only one image file is allowed'
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          error: 'Unexpected field name. Use "image" as the field name'
        });
      }
      
      return res.status(400).json({
        success: false,
        error: `Upload error: ${err.message}`
      });
    }
    
    if (err) {
      // Handle custom validation errors
      return res.status(400).json({
        success: false,
        error: err.message || 'Invalid file type'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    // Additional server-side validation
    const validator = new FileValidator();
    const validation = validator.validateFile(req.file);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // File is valid, proceed to next middleware
    next();
  });
};

/**
 * Error handling middleware for upload errors
 */
export const uploadErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError || err.message.includes('file')) {
    return res.status(400).json({
      success: false,
      error: err.message || 'File upload error'
    });
  }
  next(err);
};