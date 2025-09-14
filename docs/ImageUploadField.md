# ImageUploadField Component

A reusable React component for handling single image uploads with drag-and-drop functionality, preview, and validation.

## Features

- ✅ **Single file input** with drag-and-drop functionality
- ✅ **Image preview** with current thumbnail display (single image only)
- ✅ **Client-side validation** for file size and format checking
- ✅ **Upload progress indicator** and status messages
- ✅ **Single image constraint** - only one image can be selected and uploaded at a time
- ✅ **Helper text** showing file restrictions
- ✅ **Error handling** with specific error messages
- ✅ **URL input integration** - works alongside manual URL entry
- ✅ **Clear/remove functionality** for uploaded images
- ✅ **Upload button disabled** during upload process

## Usage

```tsx
import { ImageUploadField } from '@/components/common/ImageUploadField';

function MyForm() {
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  return (
    <ImageUploadField
      value={thumbnailUrl}
      onChange={setThumbnailUrl}
      label="Thumbnail Image"
      placeholder="https://example.com/image.jpg"
      required={false}
      maxSizeKB={500}
      acceptedFormats={['jpg', 'jpeg', 'png', 'gif', 'webp']}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | Current URL value (controlled component) |
| `onChange` | `(url: string) => void` | - | Callback when URL changes |
| `label` | `string` | - | Label text for the field |
| `placeholder` | `string` | `"https://..."` | Placeholder text for URL input |
| `required` | `boolean` | `false` | Whether the field is required |
| `maxSizeKB` | `number` | `500` | Maximum file size in KB |
| `acceptedFormats` | `string[]` | `['jpg', 'jpeg', 'png', 'gif', 'webp']` | Accepted file formats |
| `className` | `string` | - | Additional CSS classes |

## Validation

### File Size
- Default maximum: 500KB
- Configurable via `maxSizeKB` prop
- Error message: "Image size must be under 500KB"

### File Type
- Supported formats: JPG, JPEG, PNG, GIF, WebP
- MIME type validation: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- Error message: "Please select a valid image file (JPG, PNG, GIF, WebP)"

## Upload Process

1. **File Selection**: User clicks upload area or drags file
2. **Client Validation**: Immediate validation of file type and size
3. **Preview Display**: Valid files show preview immediately
4. **Upload Request**: POST to `/api/upload/image` with FormData
5. **Progress Indication**: Loading spinner and disabled state
6. **Auto-Population**: Successful upload fills URL field automatically
7. **Error Handling**: Display specific error messages for failures

## API Integration

The component expects a backend endpoint at `/api/upload/image` that:

- Accepts `multipart/form-data` with `file` field
- Accepts optional `existingUrl` field for image replacement
- Accepts `type` field set to `'crucible-thumbnail'`
- Returns JSON response:
  ```json
  {
    "success": true,
    "url": "https://storage.example.com/image.jpg"
  }
  ```

## Error Messages

The component displays specific error messages as defined in requirements:

- **File too large**: "Image size must be under 500KB"
- **Invalid file type**: "Please select a valid image file (JPG, PNG, GIF, WebP)"
- **Upload failed**: "Failed to upload image. Please try again."
- **Network error**: "Network error. Please check your connection and try again."
- **Storage error**: "Storage service unavailable. Please try again later."

## Accessibility

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- Focus management during upload

## Styling

The component uses DaisyUI classes and follows the existing design system:

- `alert alert-error` for error messages
- `alert alert-success` for success messages
- `loading loading-spinner` for progress indication
- `btn` classes for buttons
- `input` classes for text input

## Requirements Mapping

This component satisfies the following requirements from the specification:

### Requirement 1 (Direct Image Upload)
- ✅ 1.1: Display both thumbnail URL input and image upload option
- ✅ 1.2: Helper text showing file restrictions
- ✅ 1.3: File picker dialog on click
- ✅ 1.4: File validation (format and size)
- ✅ 1.5: Image preview display
- ✅ 1.6: Error message for invalid file format
- ✅ 1.7: Error message for oversized files

### Requirement 3 (Progress and Status)
- ✅ 3.1: Progress indicator during upload
- ✅ 3.2: Success message display
- ✅ 3.3: Clear error messages with failure reasons
- ✅ 3.4: Upload button disabled during progress

## Testing

Run the component tests:

```bash
# If testing framework is set up
npm test ImageUploadField.test.tsx
```

Use the demo component for manual testing:

```tsx
import { ImageUploadFieldDemo } from '@/components/common/ImageUploadFieldDemo';
```

## Development

For development and testing, use the verification component:

```tsx
import ImageUploadFieldVerification from '@/components/common/ImageUploadField.verify';
```

This provides a comprehensive test interface with all requirements checklist.