import { supabaseConfig, validateSupabaseConfig, validateStorageBucketAccess } from '../config/supabase';
import { logger } from './logger';

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: {
    url: string;
    bucket: string;
    maxFileSizeKB: number;
    allowedFileTypes: string[];
    uploadTimeoutMs: number;
  };
}

/**
 * Comprehensive configuration validation
 */
export const validateConfiguration = async (): Promise<ConfigValidationResult> => {
  const result: ConfigValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    config: {
      url: supabaseConfig.url,
      bucket: supabaseConfig.storageBucket,
      maxFileSizeKB: supabaseConfig.maxFileSizeKB,
      allowedFileTypes: supabaseConfig.allowedFileTypes,
      uploadTimeoutMs: supabaseConfig.uploadTimeoutMs
    }
  };

  logger.info('Starting configuration validation', {
    operation: 'config_validation'
  });

  // Validate environment variables
  if (!validateSupabaseConfig()) {
    result.isValid = false;
    result.errors.push('Supabase environment variables validation failed');
  }

  // Validate configuration values
  if (supabaseConfig.maxFileSizeKB <= 0 || supabaseConfig.maxFileSizeKB > 10000) {
    result.errors.push('MAX_FILE_SIZE_KB must be between 1 and 10000');
    result.isValid = false;
  }

  if (supabaseConfig.allowedFileTypes.length === 0) {
    result.errors.push('ALLOWED_FILE_TYPES must not be empty');
    result.isValid = false;
  }

  if (supabaseConfig.uploadTimeoutMs <= 0) {
    result.errors.push('UPLOAD_TIMEOUT_MS must be greater than 0');
    result.isValid = false;
  }

  // Validate URL format
  if (!supabaseConfig.url.startsWith('https://')) {
    result.errors.push('SUPABASE_URL must be a valid HTTPS URL');
    result.isValid = false;
  }

  // Test storage bucket access if basic validation passes
  if (result.isValid) {
    try {
      const storageAccessValid = await validateStorageBucketAccess();
      if (!storageAccessValid) {
        result.errors.push('Storage bucket access validation failed');
        result.isValid = false;
      }
    } catch (error) {
      result.errors.push(`Storage bucket access test failed: ${(error as Error).message}`);
      result.isValid = false;
    }
  }

  // Add warnings for non-critical issues
  if (supabaseConfig.maxFileSizeKB > 5000) {
    result.warnings.push('MAX_FILE_SIZE_KB is quite large (>5MB), consider reducing for better performance');
  }

  if (process.env.NODE_ENV === 'production' && process.env.LOG_LEVEL === 'DEBUG') {
    result.warnings.push('DEBUG logging is enabled in production, consider setting LOG_LEVEL to INFO or ERROR');
  }

  if (!process.env.CORS_ORIGIN) {
    result.warnings.push('CORS_ORIGIN is not set, this may cause issues with frontend uploads');
  }

  logger.info('Configuration validation completed', {
    operation: 'config_validation',
    isValid: result.isValid,
    errorCount: result.errors.length,
    warningCount: result.warnings.length
  });

  return result;
};

/**
 * Log configuration validation results
 */
export const logValidationResults = (result: ConfigValidationResult): void => {
  if (result.isValid) {
    logger.info('✅ Configuration validation passed', {
      operation: 'config_validation_summary',
      config: result.config,
      warnings: result.warnings
    });
  } else {
    logger.error('❌ Configuration validation failed', {
      operation: 'config_validation_summary',
      errors: result.errors,
      warnings: result.warnings
    });
  }

  // Log warnings separately
  result.warnings.forEach(warning => {
    logger.warn(`⚠️  Configuration warning: ${warning}`, {
      operation: 'config_validation_warning'
    });
  });
};

/**
 * Validate configuration and log results
 */
export const validateAndLogConfiguration = async (): Promise<boolean> => {
  try {
    const result = await validateConfiguration();
    logValidationResults(result);
    return result.isValid;
  } catch (error) {
    logger.error('Configuration validation failed with unexpected error', {
      operation: 'config_validation'
    }, error as Error);
    return false;
  }
};