import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  storageBucket: string;
  maxFileSizeKB: number;
  allowedFileTypes: string[];
  uploadTimeoutMs: number;
}

export const supabaseConfig: SupabaseConfig = {
  url: process.env.SUPABASE_URL || '',
  anonKey: process.env.SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'crucible-images',
  maxFileSizeKB: parseInt(process.env.MAX_FILE_SIZE_KB || '500'),
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(','),
  uploadTimeoutMs: parseInt(process.env.UPLOAD_TIMEOUT_MS || '30000')
};

/**
 * Create Supabase client with service role key for admin operations
 */
export const createSupabaseServiceClient = (): SupabaseClient => {
  if (!supabaseConfig.url || !supabaseConfig.serviceRoleKey) {
    const error = new Error('Missing required Supabase configuration. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    logger.error('Failed to create Supabase service client', {
      operation: 'create_service_client',
      hasUrl: !!supabaseConfig.url,
      hasServiceRoleKey: !!supabaseConfig.serviceRoleKey
    }, error);
    throw error;
  }

  logger.debug('Creating Supabase service client', {
    operation: 'create_service_client',
    url: supabaseConfig.url,
    bucket: supabaseConfig.storageBucket
  });

  return createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

/**
 * Create Supabase client with anon key for public operations
 */
export const createSupabaseAnonClient = (): SupabaseClient => {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    const error = new Error('Missing required Supabase configuration. Please check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    logger.error('Failed to create Supabase anon client', {
      operation: 'create_anon_client',
      hasUrl: !!supabaseConfig.url,
      hasAnonKey: !!supabaseConfig.anonKey
    }, error);
    throw error;
  }

  logger.debug('Creating Supabase anon client', {
    operation: 'create_anon_client',
    url: supabaseConfig.url
  });

  return createClient(supabaseConfig.url, supabaseConfig.anonKey);
};

/**
 * Validate Supabase configuration
 */
export const validateSupabaseConfig = (): boolean => {
  const requiredVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    logger.storageConfigError(missingVars);
    return false;
  }

  // Validate configuration values
  const validationErrors: string[] = [];

  if (!supabaseConfig.url.startsWith('https://')) {
    validationErrors.push('SUPABASE_URL must be a valid HTTPS URL');
  }

  if (supabaseConfig.maxFileSizeKB <= 0 || supabaseConfig.maxFileSizeKB > 10000) {
    validationErrors.push('MAX_FILE_SIZE_KB must be between 1 and 10000');
  }

  if (supabaseConfig.allowedFileTypes.length === 0) {
    validationErrors.push('ALLOWED_FILE_TYPES must not be empty');
  }

  if (supabaseConfig.uploadTimeoutMs <= 0) {
    validationErrors.push('UPLOAD_TIMEOUT_MS must be greater than 0');
  }

  if (validationErrors.length > 0) {
    logger.error('Supabase configuration validation failed', {
      operation: 'config_validation',
      validationErrors
    });
    return false;
  }

  logger.info('Supabase configuration validated successfully', {
    operation: 'config_validation',
    bucket: supabaseConfig.storageBucket,
    maxFileSizeKB: supabaseConfig.maxFileSizeKB,
    allowedFileTypes: supabaseConfig.allowedFileTypes,
    uploadTimeoutMs: supabaseConfig.uploadTimeoutMs
  });

  return true;
};

/**
 * Test storage bucket access and configuration
 */
export const validateStorageBucketAccess = async (): Promise<boolean> => {
  try {
    const client = createSupabaseServiceClient();
    
    logger.info('Testing storage bucket access', {
      operation: 'bucket_access_test',
      bucket: supabaseConfig.storageBucket
    });

    // Test bucket access by listing files (limit 1 for efficiency)
    const { data, error } = await client.storage
      .from(supabaseConfig.storageBucket)
      .list('', { limit: 1 });

    if (error) {
      logger.storageAccessError(supabaseConfig.storageBucket, error);
      return false;
    }

    logger.info('Storage bucket access validated successfully', {
      operation: 'bucket_access_test',
      bucket: supabaseConfig.storageBucket,
      fileCount: data?.length || 0
    });

    return true;
  } catch (error) {
    logger.storageAccessError(supabaseConfig.storageBucket, error as Error);
    return false;
  }
};

/**
 * Initialize and validate all Supabase configuration
 */
export const initializeSupabaseConfig = async (): Promise<boolean> => {
  logger.info('Initializing Supabase configuration', {
    operation: 'config_initialization'
  });

  // Validate environment variables
  if (!validateSupabaseConfig()) {
    return false;
  }

  // Test storage bucket access
  if (!await validateStorageBucketAccess()) {
    return false;
  }

  logger.info('Supabase configuration initialized successfully', {
    operation: 'config_initialization'
  });

  return true;
};