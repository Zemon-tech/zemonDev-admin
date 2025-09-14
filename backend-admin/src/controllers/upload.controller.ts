import { Request, Response } from 'express';
import { SupabaseStorageService, StorageUploadResult } from '../services/supabaseStorage.service';
import { asyncUploadHandler } from '../middleware/uploadErrorHandler';
import { logger, Logger } from '../utils/logger';

interface UploadRequest extends Request {
  file: Express.Multer.File;
  body: {
    existingUrl?: string;
  };
}

/**
 * Upload image to Supabase storage
 * POST /api/upload/image
 */
export const uploadImage = asyncUploadHandler(async (req: UploadRequest, res: Response) => {
  const requestContext = Logger.extractRequestContext(req);
  const controllerContext = {
    ...requestContext,
    operation: 'upload_image_controller'
  };

  logger.info('Image upload request received', {
    ...controllerContext,
    hasFile: !!req.file,
    hasExistingUrl: !!req.body.existingUrl,
    originalName: req.file?.originalname,
    fileSize: req.file?.size,
    mimeType: req.file?.mimetype
  });

  try {
    // File validation is already handled by uploadImageMiddleware
    const file = req.file;
    const { existingUrl } = req.body;

    if (!file) {
      logger.warn('Upload request missing file', controllerContext);
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    const storageService = new SupabaseStorageService(undefined, requestContext);
    
    // Generate unique filename
    const uniqueFilename = storageService.generateUniqueFilename(file.originalname);

    logger.debug('Generated unique filename', {
      ...controllerContext,
      originalName: file.originalname,
      uniqueFilename
    });

    let result: StorageUploadResult;

    if (existingUrl) {
      logger.info('Replacing existing image', {
        ...controllerContext,
        existingUrl,
        newFilename: uniqueFilename
      });
      // Replace existing image
      result = await storageService.replaceImage(file.buffer, uniqueFilename, existingUrl);
    } else {
      logger.info('Uploading new image', {
        ...controllerContext,
        filename: uniqueFilename
      });
      // Upload new image
      result = await storageService.uploadImage(file.buffer, uniqueFilename);
    }

    if (!result.success) {
      logger.error('Storage service returned error', {
        ...controllerContext,
        storageError: result.error,
        filename: uniqueFilename
      });
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to upload image'
      });
    }

    logger.info('Image upload completed successfully', {
      ...controllerContext,
      url: result.url,
      filename: result.filename
    });

    // Return success response with public URL
    return res.status(200).json({
      success: true,
      url: result.url,
      filename: result.filename
    });

  } catch (error) {
    logger.error('Unexpected error in upload controller', controllerContext, error as Error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during image upload'
    });
  }
});