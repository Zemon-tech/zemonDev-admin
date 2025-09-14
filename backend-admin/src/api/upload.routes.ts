import express from 'express';
import { uploadImage } from '../controllers/upload.controller';
import { uploadImageMiddleware } from '../middleware/upload';
import { multerErrorHandler } from '../middleware/uploadErrorHandler';

const router = express.Router();

/**
 * POST /api/upload/image
 * Upload single image file to Supabase storage
 * Expects multipart/form-data with 'image' field
 * Optional 'existingUrl' field for image replacement
 */
router.post('/image', uploadImageMiddleware, multerErrorHandler, uploadImage);

export default router;