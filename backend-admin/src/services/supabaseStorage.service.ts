import { createSupabaseServiceClient, supabaseConfig } from '../config/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { FileValidator } from '../utils/fileValidation';
import { logger, LogContext } from '../utils/logger';

export interface StorageUploadResult {
    success: boolean;
    url?: string;
    filename?: string;
    error?: string;
}

export interface StorageDeleteResult {
    success: boolean;
    error?: string;
}

export class SupabaseStorageService {
    private supabase: SupabaseClient;
    private bucket: string;
    private fileValidator: FileValidator;
    private context: LogContext;

    constructor(bucket?: string, context?: LogContext) {
        this.supabase = createSupabaseServiceClient();
        this.bucket = bucket || supabaseConfig.storageBucket;
        this.fileValidator = new FileValidator();
        this.context = context || {};

        logger.debug('SupabaseStorageService initialized', {
            ...this.context,
            operation: 'service_init',
            bucket: this.bucket
        });
    }

    /**
     * Upload image to Supabase storage
     * @param file - File buffer to upload
     * @param filename - Filename to use for storage
     * @returns Promise with upload result containing public URL
     */
    async uploadImage(file: Buffer, filename: string): Promise<StorageUploadResult> {
        const uploadContext = {
            ...this.context,
            filename,
            fileSize: file.length,
            bucket: this.bucket,
            contentType: this.getMimeTypeFromFilename(filename)
        };

        logger.uploadStart(filename, file.length, uploadContext);

        try {
            // Upload file to Supabase storage
            const { data, error } = await this.supabase.storage
                .from(this.bucket)
                .upload(filename, file, {
                    contentType: this.getMimeTypeFromFilename(filename),
                    upsert: false // Don't overwrite existing files
                });

            if (error) {
                logger.uploadError(filename, error, {
                    ...uploadContext,
                    supabaseError: error.message
                });
                return {
                    success: false,
                    error: 'Failed to upload image to storage'
                };
            }

            logger.debug('File uploaded to storage successfully', {
                ...uploadContext,
                uploadPath: data?.path
            });

            // Get public URL for the uploaded file
            const { data: publicUrlData } = this.supabase.storage
                .from(this.bucket)
                .getPublicUrl(filename);

            if (!publicUrlData?.publicUrl) {
                const error = new Error('Failed to generate public URL');
                logger.uploadError(filename, error, {
                    ...uploadContext,
                    step: 'get_public_url'
                });
                return {
                    success: false,
                    error: 'Failed to generate public URL for uploaded image'
                };
            }

            logger.uploadSuccess(filename, publicUrlData.publicUrl, {
                ...uploadContext,
                url: publicUrlData.publicUrl
            });

            return {
                success: true,
                url: publicUrlData.publicUrl,
                filename: filename
            };

        } catch (error) {
            logger.uploadError(filename, error as Error, uploadContext);
            return {
                success: false,
                error: 'Unexpected error occurred during upload'
            };
        }
    }

    /**
     * Delete image from Supabase storage
     * @param url - Public URL of the image to delete
     * @returns Promise with deletion result
     */
    async deleteImage(url: string): Promise<StorageDeleteResult> {
        const deleteContext = {
            ...this.context,
            url,
            bucket: this.bucket
        };

        logger.deleteStart(url, deleteContext);

        try {
            const filename = this.extractFilenameFromUrl(url);

            if (!filename) {
                const error = new Error('Invalid URL: cannot extract filename');
                logger.deleteError(url, error, {
                    ...deleteContext,
                    step: 'extract_filename'
                });
                return {
                    success: false,
                    error: 'Invalid URL: cannot extract filename'
                };
            }

            logger.debug('Extracted filename from URL', {
                ...deleteContext,
                filename
            });

            const { error } = await this.supabase.storage
                .from(this.bucket)
                .remove([filename]);

            if (error) {
                logger.deleteError(url, error, {
                    ...deleteContext,
                    filename,
                    supabaseError: error.message
                });
                return {
                    success: false,
                    error: 'Failed to delete image from storage'
                };
            }

            logger.deleteSuccess(url, {
                ...deleteContext,
                filename
            });

            return {
                success: true
            };

        } catch (error) {
            logger.deleteError(url, error as Error, deleteContext);
            return {
                success: false,
                error: 'Unexpected error occurred during deletion'
            };
        }
    }

    /**
     * Replace existing image with new one (atomic operation)
     * Upload new image first, then delete old image only if upload succeeds
     * @param file - New file buffer to upload
     * @param filename - Filename for the new file
     * @param oldUrl - URL of existing image to replace
     * @returns Promise with upload result
     */
    async replaceImage(file: Buffer, filename: string, oldUrl: string): Promise<StorageUploadResult> {
        const replaceContext = {
            ...this.context,
            operation: 'replace_image',
            filename,
            fileSize: file.length,
            oldUrl,
            bucket: this.bucket
        };

        logger.info('Starting image replacement', replaceContext);

        try {
            // First, upload the new image
            const uploadResult = await this.uploadImage(file, filename);

            if (!uploadResult.success) {
                logger.error('Image replacement failed during upload', {
                    ...replaceContext,
                    uploadError: uploadResult.error
                });
                return uploadResult;
            }

            logger.info('New image uploaded successfully, deleting old image', {
                ...replaceContext,
                newUrl: uploadResult.url
            });

            // Only delete old image if new upload was successful
            const deleteResult = await this.deleteImage(oldUrl);

            if (!deleteResult.success) {
                // Log warning but don't fail the operation since new image was uploaded successfully
                logger.warn('Failed to delete old image during replacement', {
                    ...replaceContext,
                    newUrl: uploadResult.url,
                    deleteError: deleteResult.error
                });
            } else {
                logger.info('Image replacement completed successfully', {
                    ...replaceContext,
                    newUrl: uploadResult.url
                });
            }

            return uploadResult;

        } catch (error) {
            logger.error('Unexpected error during image replacement', replaceContext, error as Error);
            return {
                success: false,
                error: 'Unexpected error occurred during image replacement'
            };
        }
    }

    /**
     * Generate unique filename with timestamp and random string
     * @param originalName - Original filename
     * @returns Unique filename with original extension
     */
    generateUniqueFilename(originalName: string): string {
        return this.fileValidator.generateUniqueFilename(originalName);
    }

    /**
     * Extract filename from Supabase public URL
     * @param url - Public URL from Supabase storage
     * @returns Filename or null if extraction fails
     */
    extractFilenameFromUrl(url: string): string | null {
        try {
            // Supabase storage URLs have format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[filename]
            const urlParts = url.split('/');
            const filename = urlParts[urlParts.length - 1];

            if (!filename || filename.length === 0) {
                logger.warn('Empty filename extracted from URL', {
                    ...this.context,
                    operation: 'extract_filename',
                    url,
                    urlParts: urlParts.length
                });
                return null;
            }

            const decodedFilename = decodeURIComponent(filename);
            logger.debug('Filename extracted successfully', {
                ...this.context,
                operation: 'extract_filename',
                url,
                filename: decodedFilename
            });

            return decodedFilename;
        } catch (error) {
            logger.error('Error extracting filename from URL', {
                ...this.context,
                operation: 'extract_filename',
                url
            }, error as Error);
            return null;
        }
    }

    /**
     * Get MIME type from filename extension
     * @param filename - Filename with extension
     * @returns MIME type string
     */
    private getMimeTypeFromFilename(filename: string): string {
        const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));

        const mimeTypes: { [key: string]: string } = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };

        return mimeTypes[extension] || 'application/octet-stream';
    }

    /**
     * Check if storage bucket exists and is accessible
     * @returns Promise with boolean result
     */
    async validateStorageAccess(): Promise<boolean> {
        const validationContext = {
            ...this.context,
            operation: 'validate_storage_access',
            bucket: this.bucket
        };

        logger.info('Validating storage bucket access', validationContext);

        try {
            const { data, error } = await this.supabase.storage
                .from(this.bucket)
                .list('', { limit: 1 });

            if (error) {
                logger.storageAccessError(this.bucket, error);
                return false;
            }

            logger.info('Storage bucket access validated successfully', {
                ...validationContext,
                fileCount: data?.length || 0
            });

            return true;
        } catch (error) {
            logger.storageAccessError(this.bucket, error as Error);
            return false;
        }
    }
}