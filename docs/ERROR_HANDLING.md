# Error Handling and Logging System

This document describes the comprehensive error handling and logging system implemented for the thumbnail upload feature.

## Overview

The system provides:
- Structured logging with contextual information
- Comprehensive error handling for upload operations
- Configuration validation and monitoring
- User-friendly error messages
- Debug information in development mode

## Logging System

### Logger Utility (`src/utils/logger.ts`)

The logger provides structured logging with different levels and contextual information.

#### Log Levels
- `ERROR`: Critical errors that need immediate attention
- `WARN`: Warning conditions that should be monitored
- `INFO`: General information about system operations
- `DEBUG`: Detailed information for debugging (development only)

#### Usage Examples

```typescript
import { logger } from '../utils/logger';

// Basic logging
logger.info('Operation completed successfully');
logger.error('Operation failed', {}, error);

// With context
logger.info('User uploaded image', {
  userId: 'user123',
  filename: 'image.jpg',
  fileSize: 1024
});

// Upload-specific methods
logger.uploadStart('image.jpg', 1024, { userId: 'user123' });
logger.uploadSuccess('image.jpg', 'https://...', { userId: 'user123' });
logger.uploadError('image.jpg', error, { userId: 'user123' });
```

#### Configuration

Set the log level using the `LOG_LEVEL` environment variable:

```bash
LOG_LEVEL=DEBUG  # Development
LOG_LEVEL=INFO   # Production
LOG_LEVEL=ERROR  # Production (errors only)
```

### Log Context

The logger automatically captures request context including:
- Request ID
- User ID
- IP address
- User agent
- Operation type
- File information (for uploads)

## Error Handling

### Upload Error Handler (`src/middleware/uploadErrorHandler.ts`)

Provides comprehensive error handling specifically for upload operations.

#### Error Types Handled

1. **File Size Errors**
   - `LIMIT_FILE_SIZE`: File exceeds size limit
   - `FILE_TOO_LARGE`: Custom file size validation

2. **File Type Errors**
   - `INVALID_FILE_TYPE`: Unsupported file format
   - `LIMIT_UNEXPECTED_FILE`: Wrong form field name

3. **Storage Errors**
   - `STORAGE_ERROR`: Supabase storage issues
   - `SUPABASE_ERROR`: Supabase API errors

4. **Network Errors**
   - `NETWORK_ERROR`: Connection issues
   - `TIMEOUT_ERROR`: Upload timeout

5. **Validation Errors**
   - `VALIDATION_ERROR`: File validation failures

#### Error Response Format

```json
{
  "success": false,
  "error": "User-friendly error message",
  "debug": {
    "originalError": "Technical error details",
    "code": "ERROR_CODE",
    "stack": "Error stack trace"
  }
}
```

Note: Debug information is only included in development mode.

### Async Upload Handler

Wraps upload operations with enhanced error handling:

```typescript
import { asyncUploadHandler } from '../middleware/uploadErrorHandler';

export const uploadImage = asyncUploadHandler(async (req, res) => {
  // Upload logic here
});
```

## Configuration Validation

### Config Validator (`src/utils/configValidator.ts`)

Validates all configuration settings on server startup.

#### Validation Checks

1. **Environment Variables**
   - Required variables are present
   - Values are in correct format

2. **Configuration Values**
   - File size limits are reasonable
   - Timeout values are positive
   - URLs are valid HTTPS

3. **Storage Access**
   - Supabase connection works
   - Bucket is accessible
   - Permissions are correct

#### Usage

```typescript
import { validateAndLogConfiguration } from '../utils/configValidator';

// Validate configuration and log results
const isValid = await validateAndLogConfiguration();
```

## Error Messages

### User-Friendly Messages

The system provides specific, actionable error messages:

- **File too large**: "Image size must be under 500KB"
- **Invalid format**: "Please select a valid image file (JPG, PNG, GIF, WebP)"
- **Upload failed**: "Failed to upload image. Please try again."
- **Network error**: "Network error. Please check your connection and try again."
- **Storage unavailable**: "Storage service temporarily unavailable. Please try again later."

### Error Codes

Internal error codes for debugging:

- `LIMIT_FILE_SIZE`: Multer file size limit exceeded
- `INVALID_FILE_TYPE`: File type validation failed
- `STORAGE_ERROR`: Supabase storage operation failed
- `NETWORK_ERROR`: Network connectivity issue
- `TIMEOUT_ERROR`: Operation timed out
- `VALIDATION_ERROR`: File validation failed

## Monitoring and Debugging

### Log Analysis

Logs include structured data for easy analysis:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "ERROR",
  "message": "Image upload failed",
  "context": {
    "operation": "upload_error",
    "userId": "user123",
    "filename": "image.jpg",
    "fileSize": 1024,
    "errorCode": "STORAGE_ERROR"
  },
  "error": {
    "message": "Storage service unavailable",
    "stack": "..."
  }
}
```

### Common Issues and Solutions

#### 1. Configuration Errors

**Symptoms**: Server fails to start or upload endpoints return 500 errors

**Solutions**:
- Check environment variables in `.env` file
- Run configuration test: `node test-storage-config.js`
- Verify Supabase credentials and bucket settings

#### 2. Storage Access Issues

**Symptoms**: "Storage bucket access validation failed"

**Solutions**:
- Verify bucket exists in Supabase project
- Check bucket permissions and RLS policies
- Ensure service role key has necessary permissions

#### 3. CORS Issues

**Symptoms**: Upload requests fail from frontend

**Solutions**:
- Configure CORS in Supabase dashboard
- Add frontend domain to allowed origins
- Check `CORS_ORIGIN` environment variable

#### 4. File Upload Failures

**Symptoms**: Files fail to upload with various errors

**Solutions**:
- Check file size and format requirements
- Verify network connectivity
- Review Supabase storage quotas
- Check server logs for detailed error information

### Debug Mode

Enable debug logging for detailed troubleshooting:

```bash
LOG_LEVEL=DEBUG
NODE_ENV=development
```

This provides:
- Detailed operation logs
- Full error stack traces
- Configuration validation details
- Request/response debugging

## Testing

### Configuration Testing

Test your configuration:

```bash
node test-storage-config.js
```

### Upload Endpoint Testing

Test the upload endpoint:

```bash
node test-upload.js
```

### Manual Testing

Use tools like Postman or curl to test uploads:

```bash
curl -X POST \
  http://localhost:5001/api/upload/image \
  -H 'Content-Type: multipart/form-data' \
  -F 'image=@test-image.jpg'
```

## Production Considerations

### Log Management

1. **Log Rotation**: Implement log rotation to prevent disk space issues
2. **Log Aggregation**: Consider using log aggregation services
3. **Monitoring**: Set up alerts for error rates and critical issues

### Error Tracking

1. **Error Monitoring**: Integrate with services like Sentry or Rollbar
2. **Metrics**: Track upload success rates and error frequencies
3. **Alerting**: Set up alerts for high error rates or critical failures

### Security

1. **Log Sanitization**: Ensure sensitive data is not logged
2. **Error Information**: Limit error details in production responses
3. **Rate Limiting**: Implement rate limiting for upload endpoints

### Performance

1. **Log Level**: Use INFO or ERROR level in production
2. **Async Logging**: Consider async logging for high-traffic applications
3. **Log Storage**: Use appropriate storage solutions for log data

## Troubleshooting Guide

### Step-by-Step Debugging

1. **Check Configuration**
   ```bash
   node test-storage-config.js
   ```

2. **Review Server Logs**
   - Look for configuration validation messages
   - Check for storage access errors
   - Review upload operation logs

3. **Test Upload Endpoint**
   ```bash
   node test-upload.js
   ```

4. **Verify Supabase Setup**
   - Check bucket exists and is public
   - Verify RLS policies
   - Test CORS configuration

5. **Check Environment Variables**
   - Ensure all required variables are set
   - Verify values are correct
   - Check for typos or formatting issues

### Common Error Patterns

1. **Startup Errors**: Usually configuration issues
2. **Upload Failures**: Often storage or network related
3. **Permission Errors**: RLS policies or bucket settings
4. **Timeout Errors**: Network or file size issues

For additional help, refer to the `STORAGE_SETUP.md` file for detailed configuration instructions.