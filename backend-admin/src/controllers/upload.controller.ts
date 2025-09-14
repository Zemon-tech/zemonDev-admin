import { Request, Response } from 'express';
import { SupabaseStorageService, StorageUploadResult, UploadType } from '../services/supabaseStorage.service';
import { asyncUploadHandler } from '../middleware/uploadErrorHandler';
import { logger, Logger } from '../utils/logger';

interface UploadRequest extends Request {
  file: Express.Multer.File;
  body: {
    existingUrl?: string;
    type?: string;
  };
}

/**
 * Upload image to Supabase storage
 * POST /api/upload/image
 * Body: { type?: 'crucible-thumbnail' | 'forge-thumbnail', existingUrl?: string }
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
    uploadType: req.body.type,
    originalName: req.file?.originalname,
    fileSize: req.file?.size,
    mimeType: req.file?.mimetype
  });

  try {
    // File validation is already handled by uploadImageMiddleware
    const file = req.file;
    const { existingUrl, type } = req.body;

    if (!file) {
      logger.warn('Upload request missing file', controllerContext);
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    // Validate upload type
    const uploadType = type as UploadType || 'crucible-thumbnail'; // Default to crucible for backward compatibility
    const validUploadTypes: UploadType[] = ['crucible-thumbnail', 'forge-thumbnail'];
    
    if (!validUploadTypes.includes(uploadType)) {
      logger.warn('Invalid upload type provided', {
        ...controllerContext,
        providedType: type,
        validTypes: validUploadTypes
      });
      return res.status(400).json({
        success: false,
        error: `Invalid upload type. Must be one of: ${validUploadTypes.join(', ')}`
      });
    }

    const storageService = new SupabaseStorageService(undefined, requestContext);
    
    // Get the appropriate bucket for the upload type
    let targetBucket: string;
    try {
      targetBucket = storageService.getBucketForUploadType(uploadType);
      
      // Validate bucket access before proceeding
      const bucketAccessible = await storageService.validateStorageAccess(targetBucket);
      if (!bucketAccessible) {
        const error = new Error(`Storage bucket not accessible: ${targetBucket}`);
        
        if (uploadType === 'forge-thumbnail') {
          logger.forgeBucketAccessError(error, {
            ...controllerContext,
            uploadType,
            targetBucket
          });
          return res.status(503).json({
            success: false,
            error: 'Forge thumbnail storage is temporarily unavailable. Please try again later.'
          });
        } else {
          logger.storageAccessError(targetBucket, error);
          return res.status(503).json({
            success: false,
            error: 'Storage service temporarily unavailable. Please try again later.'
          });
        }
      }
      
    } catch (error) {
      logger.error('Failed to get bucket for upload type', {
        ...controllerContext,
        uploadType,
        error: (error as Error).message
      });
      return res.status(400).json({
        success: false,
        error: `Invalid upload type: ${uploadType}`
      });
    }
    
    // Generate unique filename
    const uniqueFilename = storageService.generateUniqueFilename(file.originalname);

    logger.debug('Generated unique filename and determined bucket', {
      ...controllerContext,
      originalName: file.originalname,
      uniqueFilename,
      uploadType,
      targetBucket
    });

    let result: StorageUploadResult;

    if (existingUrl) {
      logger.info('Replacing existing image', {
        ...controllerContext,
        existingUrl,
        newFilename: uniqueFilename,
        uploadType,
        targetBucket
      });
      // Replace existing image in the appropriate bucket
      result = await storageService.replaceImage(file.buffer, uniqueFilename, existingUrl, targetBucket);
    } else {
      logger.info('Uploading new image', {
        ...controllerContext,
        filename: uniqueFilename,
        uploadType,
        targetBucket
      });
      // Upload new image to the appropriate bucket
      result = await storageService.uploadImage(file.buffer, uniqueFilename, targetBucket);
    }

    if (!result.success) {
      const errorMessage = uploadType === 'forge-thumbnail' 
        ? result.error || 'Failed to upload forge thumbnail'
        : result.error || 'Failed to upload image';
        
      logger.error('Storage service returned error', {
        ...controllerContext,
        storageError: result.error,
        filename: uniqueFilename,
        uploadType,
        targetBucket,
        isForgeUpload: uploadType === 'forge-thumbnail'
      });
      
      return res.status(500).json({
        success: false,
        error: errorMessage
      });
    }

    logger.info('Image upload completed successfully', {
      ...controllerContext,
      url: result.url,
      filename: result.filename,
      uploadType,
      targetBucket
    });

    // Return success response with public URL and bucket information
    return res.status(200).json({
      success: true,
      url: result.url,
      filename: result.filename,
      bucket: targetBucket,
      uploadType: uploadType
    });

  } catch (error) {
    logger.error('Unexpected error in upload controller', controllerContext, error as Error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during image upload'
    });
  }
});