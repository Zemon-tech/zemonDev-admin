import React, { useState } from 'react';
import { ImageUploadField } from './ImageUploadField';

/**
 * Demo component to test ImageUploadField functionality
 * This can be used for manual testing and development
 */
export const ImageUploadFieldDemo: React.FC = () => {
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">ImageUploadField Demo</h1>
        <p className="text-base-content/70">Test the image upload functionality</p>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Upload Test</h2>
          
          <ImageUploadField
            value={thumbnailUrl}
            onChange={setThumbnailUrl}
            label="Thumbnail Image"
            placeholder="https://example.com/image.jpg"
            required={false}
            maxSizeKB={500}
            uploadType="crucible-thumbnail"
          />

          <div className="divider">Current State</div>
          
          <div className="mockup-code">
            <pre data-prefix="$">
              <code>thumbnailUrl: "{thumbnailUrl}"</code>
            </pre>
          </div>

          {thumbnailUrl && (
            <div className="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>URL has been set: {thumbnailUrl}</span>
            </div>
          )}
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Test Cases</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <input type="checkbox" className="checkbox checkbox-xs" />
              <span>Upload a valid image (JPG, PNG, GIF, WebP)</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" className="checkbox checkbox-xs" />
              <span>Try uploading a file larger than 500KB</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" className="checkbox checkbox-xs" />
              <span>Try uploading a non-image file</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" className="checkbox checkbox-xs" />
              <span>Test drag and drop functionality</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" className="checkbox checkbox-xs" />
              <span>Enter a URL manually</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" className="checkbox checkbox-xs" />
              <span>Clear the preview</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" className="checkbox checkbox-xs" />
              <span>Replace an existing image</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};