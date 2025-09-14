# Supabase Storage Configuration Guide

This document provides instructions for setting up Supabase storage bucket and CORS policies for the thumbnail upload feature.

## Environment Variables

Ensure the following environment variables are set in your `.env` file:

```bash
# Supabase Configuration (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Storage Configuration
SUPABASE_STORAGE_BUCKET=crucible-thumbnail-1
MAX_FILE_SIZE_KB=500

# Logging Configuration
LOG_LEVEL=DEBUG
NODE_ENV=development

# Upload Configuration
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
UPLOAD_TIMEOUT_MS=30000
```

## Supabase Storage Bucket Setup

### 1. Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Set the bucket name to match your `SUPABASE_STORAGE_BUCKET` environment variable (e.g., `crucible-thumbnail-1`)
5. Set the bucket to **Public** (required for thumbnail display)
6. Click **Create bucket**

### 2. Configure Bucket Policies

Create the following RLS (Row Level Security) policies for your storage bucket:

#### Policy 1: Allow Public Read Access
```sql
-- Policy name: "Public read access for thumbnails"
-- Operation: SELECT
-- Target roles: public

CREATE POLICY "Public read access for thumbnails" ON storage.objects
FOR SELECT USING (bucket_id = 'crucible-thumbnail-1');
```

#### Policy 2: Allow Authenticated Upload
```sql
-- Policy name: "Allow authenticated uploads"
-- Operation: INSERT
-- Target roles: authenticated

CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'crucible-thumbnail-1' 
  AND auth.role() = 'authenticated'
);
```

#### Policy 3: Allow Authenticated Delete
```sql
-- Policy name: "Allow authenticated delete"
-- Operation: DELETE
-- Target roles: authenticated

CREATE POLICY "Allow authenticated delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'crucible-thumbnail-1' 
  AND auth.role() = 'authenticated'
);
```

### 3. Configure CORS Policies

Set up CORS policies to allow uploads from your frontend domain:

1. Go to **Settings** > **API** in your Supabase dashboard
2. Scroll down to **CORS configuration**
3. Add your frontend domain(s) to the allowed origins:

```json
{
  "allowedOrigins": [
    "http://localhost:5174",
    "https://your-frontend-domain.com"
  ],
  "allowedMethods": [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "OPTIONS"
  ],
  "allowedHeaders": [
    "authorization",
    "content-type",
    "x-client-info",
    "apikey"
  ]
}
```

## File Upload Constraints

The system enforces the following constraints:

- **File Types**: JPG, JPEG, PNG, GIF, WebP only
- **File Size**: Maximum 500KB (configurable via `MAX_FILE_SIZE_KB`)
- **Upload Timeout**: 30 seconds (configurable via `UPLOAD_TIMEOUT_MS`)
- **Unique Filenames**: Automatically generated to prevent conflicts

## Testing Storage Configuration

You can test your storage configuration using the provided test script:

```bash
cd backend-admin
node test-upload.js
```

This script will:
1. Validate environment variables
2. Test storage bucket access
3. Attempt a test file upload
4. Clean up test files

## Troubleshooting

### Common Issues

#### 1. "Missing required Supabase environment variables"
- Ensure all required environment variables are set in your `.env` file
- Check that the `.env` file is in the correct location (`backend-admin/.env`)
- Restart your server after updating environment variables

#### 2. "Storage bucket access validation failed"
- Verify the bucket name matches your `SUPABASE_STORAGE_BUCKET` environment variable
- Ensure the bucket exists in your Supabase project
- Check that the service role key has the necessary permissions

#### 3. "Failed to upload image to storage"
- Verify CORS policies are configured correctly
- Check that the bucket is set to public
- Ensure RLS policies allow the required operations

#### 4. "Failed to generate public URL"
- Confirm the bucket is set to public
- Check that the file was uploaded successfully
- Verify the bucket name is correct

### Debug Logging

Enable debug logging by setting `LOG_LEVEL=DEBUG` in your environment variables. This will provide detailed logs for:

- Storage service initialization
- File upload progress
- Error details with context
- Configuration validation

### Storage Bucket Verification

The application automatically validates storage configuration on startup. Check the logs for:

```
[INFO] Supabase configuration validated successfully
[INFO] Storage bucket access validated successfully
[INFO] Supabase configuration initialized successfully
```

If you see error messages, follow the troubleshooting steps above.

## Security Considerations

1. **Service Role Key**: Keep your service role key secure and never expose it in client-side code
2. **File Validation**: The system validates file types and sizes on both client and server
3. **Unique Filenames**: Prevents file conflicts and potential security issues
4. **Public Access**: Only uploaded images are publicly accessible, not the entire bucket
5. **Rate Limiting**: Consider implementing rate limiting for upload endpoints in production

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Set `LOG_LEVEL=INFO` or `ERROR` to reduce log verbosity
3. Configure proper CORS origins for your production domain
4. Consider implementing additional security measures like rate limiting
5. Monitor storage usage and implement cleanup policies for old files
6. Set up proper backup and disaster recovery procedures