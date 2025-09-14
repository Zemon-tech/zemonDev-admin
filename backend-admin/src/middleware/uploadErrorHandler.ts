import { Request, Response, NextFunction } from 'express';
import { logger, Logger } from '../utils/logger';

export interface UploadError extends Error {
  code?: string;
  statusCode?: number;
  field?: string;
  originalError?: Error;
}

/**
 * Enhanced error handler specifically for upload operations
 */
export const uploadErrorHandler = (
  error: UploadError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestContext = Logger.extractRequestContext(req);
  const errorContext = {
    ...requestContext,
    operation: 'upload_error_handler',
    errorCode: error.code,
    statusCode: error.statusCode,
    field: error.field
  };

  // Log the error with full context
  logger.error('Upload operation failed', errorContext, error);

  // Handle specific error types
  let statusCode = 500;
  let errorMessage = 'Internal server error during upload';

  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      statusCode = 413;
      errorMessage = `File size exceeds the maximum limit of ${process.env.MAX_FILE_SIZE_KB || 500}KB`;
      break;

    case 'LIMIT_FILE_COUNT':
      statusCode = 400;
      errorMessage = 'Too many files uploaded. Only one file is allowed.';
      break;

    case 'LIMIT_UNEXPECTED_FILE':
      statusCode = 400;
      errorMessage = 'Unexpected file field. Please use "image" field for file uploads.';
      break;

    case 'INVALID_FILE_TYPE':
      statusCode = 400;
      errorMessage = 'Please select a valid image file (JPG, PNG, GIF, WebP)';
      break;

    case 'FILE_TOO_LARGE':
      statusCode = 413;
      errorMessage = `Image size must be under ${process.env.MAX_FILE_SIZE_KB || 500}KB`;
      break;

    case 'STORAGE_ERROR':
      statusCode = 503;
      errorMessage = 'Storage service temporarily unavailable. Please try again later.';
      break;

    case 'NETWORK_ERROR':
      statusCode = 502;
      errorMessage = 'Network error occurred during upload. Please check your connection and try again.';
      break;

    case 'TIMEOUT_ERROR':
      statusCode = 408;
      errorMessage = 'Upload timeout. Please try uploading a smaller file or check your connection.';
      break;

    case 'VALIDATION_ERROR':
      statusCode = 400;
      errorMessage = error.message || 'File validation failed';
      break;

    case 'SUPABASE_ERROR':
      statusCode = 503;
      errorMessage = 'Storage service error. Please try again later.';
      break;

    default:
      // Check for common HTTP status codes
      if (error.statusCode) {
        statusCode = error.statusCode;
        if (statusCode >= 400 && statusCode < 500) {
          errorMessage = error.message || 'Client error during upload';
        } else if (statusCode >= 500) {
          errorMessage = 'Server error during upload. Please try again later.';
        }
      }
      break;
  }

  // Log specific error handling
  logger.info('Error mapped to user-friendly response', {
    ...errorContext,
    mappedStatusCode: statusCode,
    mappedMessage: errorMessage
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: errorMessage,
    ...(process.env.NODE_ENV === 'development' && {
      debug: {
        originalError: error.message,
        code: error.code,
        stack: error.stack
      }
    })
  });
};

/**
 * Async wrapper for upload operations with enhanced error handling
 */
export const asyncUploadHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestContext = Logger.extractRequestContext(req);
    
    logger.info('Starting upload operation', {
      ...requestContext,
      operation: 'upload_operation_start',
      method: req.method,
      url: req.url,
      hasFile: !!req.file,
      contentType: req.headers['content-type']
    });

    Promise.resolve(fn(req, res, next))
      .then((result) => {
        logger.info('Upload operation completed successfully', {
          ...requestContext,
          operation: 'upload_operation_success'
        });
        return result;
      })
      .catch((error) => {
        // Enhance error with additional context
        const enhancedError: UploadError = error;
        enhancedError.originalError = error;
        
        // Add request context to error
        if (req.file) {
          enhancedError.field = 'image';
        }

        uploadErrorHandler(enhancedError, req, res, next);
      });
  };
};

/**
 * Middleware to handle multer errors specifically
 */
export const multerErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error) {
    const uploadError: UploadError = new Error(error.message);
    uploadError.code = error.code;
    uploadError.statusCode = error.statusCode;
    uploadError.field = error.field;
    uploadError.originalError = error;

    uploadErrorHandler(uploadError, req, res, next);
  } else {
    next();
  }
};