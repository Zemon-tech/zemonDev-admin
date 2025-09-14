import { createSupabaseServiceClient, supabaseConfig } from '../config/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { FileValidator } from '../utils/fileValidation';
import { logger, LogContext } from '../utils/logger';

// Bucket mapping for different upload types
const BUCKET_MAPPING = {
  'crucible-thumbnail': 'crucible-thumbnail-1',
  'forge-thumbnail': 'forge-thumbnail-1'
} as const;

export type UploadType = keyof typeof BUCKET_MAPPING;

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
     * Get the appropriate bucket name for a given upload type
     * @param uploadType - The type of upload (crucible-thumbnail, forge-thumbnail)
     * @returns The bucket name for the upload type
     */
    getBucketForUploadType(uploadType: UploadType): string {
        const bucket = BUCKET_MAPPING[uploadType];
        
        if (!bucket) {
            logger.error('Invalid upload type provided', {
                ...this.context,
                operation: 'get_bucket_for_upload_type',
                uploadType,
                availableTypes: Object.keys(BUCKET_MAPPING)
            });
            throw new Error(`Invalid upload type: ${uploadType}`);
        }

        // Map to actual environment variable values
        switch (uploadType) {
            case 'crucible-thumbnail':
                return supabaseConfig.storageBucket;
            case 'forge-thumbnail':
                return supabaseConfig.forgeBucket;
            default:
                throw new Error(`Unsupported upload type: ${uploadType}`);
        }
    }

    /**
     * Get upload type from bucket name (reverse mapping)
     * @param bucket - The bucket name
     * @returns The upload type for the bucket
     */
    private getUploadTypeFromBucket(bucket: string): string {
        if (bucket === supabaseConfig.forgeBucket) {
            return 'forge-thumbnail';
        } else if (bucket === supabaseConfig.storageBucket) {
            return 'crucible-thumbnail';
        }
        return 'unknown';
    }

    /**
     * Upload image to Supabase storage
     * @param file - File buffer to upload
     * @param filename - Filename to use for storage
     * @param bucket - Optional bucket name, defaults to instance bucket
     * @returns Promise with upload result containing public URL
     */
    async uploadImage(file: Buffer, filename: string, bucket?: string): Promise<StorageUploadResult> {
        const targetBucket = bucket || this.bucket;
        const uploadType = this.getUploadTypeFromBucket(targetBucket);
        const uploadContext = {
            ...this.context,
            filename,
            fileSize: file.length,
            bucket: targetBucket,
            uploadType,
            contentType: this.getMimeTypeFromFilename(filename)
        };

        // Use forge-specific logging if this is a forge upload
        if (uploadType === 'forge-thumbnail') {
            logger.forgeUploadStart(filename, file.length, uploadContext);
        } else {
            logger.uploadStart(filename, file.length, uploadContext);
        }

        try {
            // Upload file to Supabase storage
            const { data, error } = await this.supabase.storage
                .from(targetBucket)
                .upload(filename, file, {
                    contentType: this.getMimeTypeFromFilename(filename),
                    upsert: false // Don't overwrite existing files
                });

            if (error) {
                const enhancedError = new Error(`Supabase storage error: ${error.message}`);
                
                if (uploadType === 'forge-thumbnail') {
                    logger.forgeUploadError(filename, enhancedError, {
                        ...uploadContext,
                        supabaseError: error.message,
                        errorCode: 'FORGE_BUCKET_ERROR'
                    });
                } else {
                    logger.uploadError(filename, enhancedError, {
                        ...uploadContext,
                        supabaseError: error.message
                    });
                }
                
                return {
                    success: false,
                    error: uploadType === 'forge-thumbnail' 
                        ? 'Failed to upload forge thumbnail to storage'
                        : 'Failed to upload image to storage'
                };
            }

            logger.debug('File uploaded to storage successfully', {
                ...uploadContext,
                uploadPath: data?.path
            });

            // Get public URL for the uploaded file
            const { data: publicUrlData } = this.supabase.storage
                .from(targetBucket)
                .getPublicUrl(filename);

            if (!publicUrlData?.publicUrl) {
                const error = new Error('Failed to generate public URL');
                
                if (uploadType === 'forge-thumbnail') {
                    logger.forgeUploadError(filename, error, {
                        ...uploadContext,
                        step: 'get_public_url'
                    });
                } else {
                    logger.uploadError(filename, error, {
                        ...uploadContext,
                        step: 'get_public_url'
                    });
                }
                
                return {
                    success: false,
                    error: uploadType === 'forge-thumbnail'
                        ? 'Failed to generate public URL for forge thumbnail'
                        : 'Failed to generate public URL for uploaded image'
                };
            }

            if (uploadType === 'forge-thumbnail') {
                logger.forgeUploadSuccess(filename, publicUrlData.publicUrl, {
                    ...uploadContext,
                    url: publicUrlData.publicUrl
                });
            } else {
                logger.uploadSuccess(filename, publicUrlData.publicUrl, {
                    ...uploadContext,
                    url: publicUrlData.publicUrl
                });
            }

            return {
                success: true,
                url: publicUrlData.publicUrl,
                filename: filename
            };

        } catch (error) {
            if (uploadType === 'forge-thumbnail') {
                logger.forgeUploadError(filename, error as Error, uploadContext);
            } else {
                logger.uploadError(filename, error as Error, uploadContext);
            }
            
            return {
                success: false,
                error: uploadType === 'forge-thumbnail'
                    ? 'Unexpected error occurred during forge thumbnail upload'
                    : 'Unexpected error occurred during upload'
            };
        }
    }

    /**
     * Delete image from Supabase storage
     * @param url - Public URL of the image to delete
     * @param bucket - Optional bucket name, defaults to instance bucket
     * @returns Promise with deletion result
     */
    async deleteImage(url: string, bucket?: string): Promise<StorageDeleteResult> {
        const targetBucket = bucket || this.bucket;
        const deleteContext = {
            ...this.context,
            url,
            bucket: targetBucket
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
                .from(targetBucket)
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
     * @param bucket - Optional bucket name, defaults to instance bucket
     * @returns Promise with upload result
     */
    async replaceImage(file: Buffer, filename: string, oldUrl: string, bucket?: string): Promise<StorageUploadResult> {
        const targetBucket = bucket || this.bucket;
        const uploadType = this.getUploadTypeFromBucket(targetBucket);
        const replaceContext = {
            ...this.context,
            operation: 'replace_image',
            filename,
            fileSize: file.length,
            oldUrl,
            bucket: targetBucket,
            uploadType
        };

        if (uploadType === 'forge-thumbnail') {
            logger.forgeReplaceStart(filename, oldUrl, replaceContext);
        } else {
            logger.info('Starting image replacement', replaceContext);
        }

        try {
            // First, upload the new image
            const uploadResult = await this.uploadImage(file, filename, targetBucket);

            if (!uploadResult.success) {
                const error = new Error(`Upload failed during replacement: ${uploadResult.error}`);
                
                if (uploadType === 'forge-thumbnail') {
                    logger.forgeReplaceError(filename, oldUrl, error, {
                        ...replaceContext,
                        uploadError: uploadResult.error,
                        step: 'upload_new_image'
                    });
                } else {
                    logger.error('Image replacement failed during upload', {
                        ...replaceContext,
                        uploadError: uploadResult.error
                    });
                }
                return uploadResult;
            }

            logger.info('New image uploaded successfully, deleting old image', {
                ...replaceContext,
                newUrl: uploadResult.url
            });

            // Only delete old image if new upload was successful
            const deleteResult = await this.deleteImage(oldUrl, targetBucket);

            if (!deleteResult.success) {
                // Log warning but don't fail the operation since new image was uploaded successfully
                if (uploadType === 'forge-thumbnail') {
                    logger.warn('Failed to delete old forge thumbnail during replacement', {
                        ...replaceContext,
                        newUrl: uploadResult.url,
                        deleteError: deleteResult.error,
                        step: 'delete_old_image'
                    });
                } else {
                    logger.warn('Failed to delete old image during replacement', {
                        ...replaceContext,
                        newUrl: uploadResult.url,
                        deleteError: deleteResult.error
                    });
                }
            } else {
                if (uploadType === 'forge-thumbnail') {
                    logger.forgeReplaceSuccess(filename, uploadResult.url!, oldUrl, {
                        ...replaceContext,
                        newUrl: uploadResult.url
                    });
                } else {
                    logger.info('Image replacement completed successfully', {
                        ...replaceContext,
                        newUrl: uploadResult.url
                    });
                }
            }

            return uploadResult;

        } catch (error) {
            if (uploadType === 'forge-thumbnail') {
                logger.forgeReplaceError(filename, oldUrl, error as Error, replaceContext);
            } else {
                logger.error('Unexpected error during image replacement', replaceContext, error as Error);
            }
            
            return {
                success: false,
                error: uploadType === 'forge-thumbnail'
                    ? 'Unexpected error occurred during forge thumbnail replacement'
                    : 'Unexpected error occurred during image replacement'
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
     * @param bucket - Optional bucket name, defaults to instance bucket
     * @returns Promise with boolean result
     */
    async validateStorageAccess(bucket?: string): Promise<boolean> {
        const targetBucket = bucket || this.bucket;
        const validationContext = {
            ...this.context,
            operation: 'validate_storage_access',
            bucket: targetBucket
        };

        logger.info('Validating storage bucket access', validationContext);

        try {
            const { data, error } = await this.supabase.storage
                .from(targetBucket)
                .list('', { limit: 1 });

            if (error) {
                // Use forge-specific error logging if this is the forge bucket
                if (targetBucket === supabaseConfig.forgeBucket) {
                    logger.forgeBucketAccessError(error, validationContext);
                } else {
                    logger.storageAccessError(targetBucket, error);
                }
                return false;
            }

            logger.info('Storage bucket access validated successfully', {
                ...validationContext,
                fileCount: data?.length || 0,
                isForgebucket: targetBucket === supabaseConfig.forgeBucket
            });

            return true;
        } catch (error) {
            // Use forge-specific error logging if this is the forge bucket
            if (targetBucket === supabaseConfig.forgeBucket) {
                logger.forgeBucketAccessError(error as Error, validationContext);
            } else {
                logger.storageAccessError(targetBucket, error as Error);
            }
            return false;
        }
    }

    /**
     * Validate access to all configured buckets
     * @returns Promise with boolean result indicating if all buckets are accessible
     */
    async validateAllBucketsAccess(): Promise<boolean> {
        const validationContext = {
            ...this.context,
            operation: 'validate_all_buckets_access'
        };

        logger.info('Validating access to all configured buckets', validationContext);

        try {
            // Validate crucible bucket
            const crucibleBucketValid = await this.validateStorageAccess(supabaseConfig.storageBucket);
            
            // Validate forge bucket
            const forgeBucketValid = await this.validateStorageAccess(supabaseConfig.forgeBucket);

            const allValid = crucibleBucketValid && forgeBucketValid;

            logger.info('All buckets validation completed', {
                ...validationContext,
                crucibleBucket: supabaseConfig.storageBucket,
                crucibleBucketValid,
                forgeBucket: supabaseConfig.forgeBucket,
                forgeBucketValid,
                allValid
            });

            return allValid;
        } catch (error) {
            logger.error('Error during all buckets validation', validationContext, error as Error);
            return false;
        }
    }

    /**
     * Attempt to recover from forge upload errors with retry logic
     * @param operation - The operation that failed
     * @param error - The original error
     * @param retryFunction - Function to retry the operation
     * @param maxRetries - Maximum number of retry attempts
     * @returns Promise with recovery result
     */
    async attemptForgeErrorRecovery<T>(
        operation: string,
        error: Error,
        retryFunction: () => Promise<T>,
        maxRetries: number = 2
    ): Promise<T> {
        const recoveryContext = {
            ...this.context,
            operation: 'forge_error_recovery',
            originalOperation: operation,
            maxRetries
        };

        logger.forgeErrorRecovery(operation, error, 'retry_with_backoff', recoveryContext);

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                logger.forgeRetryAttempt(operation, attempt, maxRetries, recoveryContext);
                
                // Add exponential backoff delay
                if (attempt > 1) {
                    const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s...
                    await new Promise(resolve => setTimeout(resolve, delay));
                }

                const result = await retryFunction();
                
                logger.info(`Forge error recovery successful on attempt ${attempt}`, {
                    ...recoveryContext,
                    successfulAttempt: attempt
                });
                
                return result;
            } catch (retryError) {
                logger.warn(`Forge retry attempt ${attempt} failed`, {
                    ...recoveryContext,
                    attempt,
                    retryError: (retryError as Error).message
                });

                if (attempt === maxRetries) {
                    logger.error('Forge error recovery failed after all attempts', {
                        ...recoveryContext,
                        finalError: (retryError as Error).message
                    });
                    throw retryError;
                }
            }
        }

        throw error; // This should never be reached, but TypeScript requires it
    }
}