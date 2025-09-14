import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';
import { useApi } from '@/lib/api';

interface ImageUploadFieldProps {
    value: string;
    onChange: (url: string) => void;
    label: string;
    placeholder?: string;
    required?: boolean;
    maxSizeKB?: number;
    acceptedFormats?: string[];
    className?: string;
    uploadType: 'crucible-thumbnail' | 'forge-thumbnail';
}

const DEFAULT_MAX_SIZE_KB = 500;
const DEFAULT_ACCEPTED_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const ERROR_MESSAGES = {
    FILE_TOO_LARGE: 'Image size must be under 500KB',
    INVALID_FILE_TYPE: 'Please select a valid image file (JPG, PNG, GIF, WebP)',
    UPLOAD_FAILED: 'Failed to upload image. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    STORAGE_ERROR: 'Storage service unavailable. Please try again later.'
};

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
    value,
    onChange,
    label,
    placeholder = "https://...",
    required = false,
    maxSizeKB = DEFAULT_MAX_SIZE_KB,
    acceptedFormats = DEFAULT_ACCEPTED_FORMATS,
    className,
    uploadType
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragCounterRef = useRef(0);
    const apiFetch = useApi();

    // Validate file on client-side
    const validateFile = useCallback((file: File): string | null => {
        // Check file type
        if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
            return ERROR_MESSAGES.INVALID_FILE_TYPE;
        }

        // Check file size (convert KB to bytes)
        const maxSizeBytes = maxSizeKB * 1024;
        if (file.size > maxSizeBytes) {
            return ERROR_MESSAGES.FILE_TOO_LARGE;
        }

        return null;
    }, [maxSizeKB]);

    // Handle upload cancellation
    const cancelUpload = useCallback(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setError('Upload cancelled');
    }, []);

    // Handle file upload with progress tracking
    const uploadFile = useCallback(async (file: File) => {
        setIsUploading(true);
        setError(null);
        setSuccess(false);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('type', uploadType);

            // Include existing URL for replacement if present
            if (value) {
                formData.append('existingUrl', value);
            }

            // Use apiFetch for proper authentication and URL handling
            const result = await apiFetch('/upload/image', {
                method: 'POST',
                body: formData
            });

            // Simulate progress for better UX since we can't track real progress with fetch
            setUploadProgress(100);

            if (result.success && result.url) {
                onChange(result.url);
                setSuccess(true);
                setPreview(result.url);

                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(false), 3000);
            } else {
                throw new Error(result.error || ERROR_MESSAGES.UPLOAD_FAILED);
            }
        } catch (err) {
            console.error('Upload error:', err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(ERROR_MESSAGES.UPLOAD_FAILED);
            }
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, [value, onChange, apiFetch, uploadType]);

    // Handle file selection
    const handleFileSelect = useCallback(async (file: File) => {
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Upload file
        await uploadFile(file);
    }, [validateFile, uploadFile]);

    // Handle file input change
    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
        // Reset input value to allow selecting the same file again
        e.target.value = '';
    }, [handleFileSelect]);

    // Handle drag events
    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current++;
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current--;
        if (dragCounterRef.current === 0) {
            setIsDragOver(false);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        dragCounterRef.current = 0;

        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find(file => ACCEPTED_MIME_TYPES.includes(file.type));

        if (imageFile) {
            handleFileSelect(imageFile);
        } else if (files.length > 0) {
            setError(ERROR_MESSAGES.INVALID_FILE_TYPE);
        }
    }, [handleFileSelect]);

    // Handle URL input change
    const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);

        // Update preview when URL changes
        if (newValue) {
            setPreview(newValue);
        } else {
            setPreview(null);
        }

        // Clear any existing errors when user types
        if (error) {
            setError(null);
        }
    }, [onChange, error]);

    // Handle clear preview
    const handleClearPreview = useCallback(() => {
        setPreview(null);
        onChange('');
        setError(null);
        setSuccess(false);
    }, [onChange]);

    // Handle click to open file dialog
    const handleUploadClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Cleanup if needed
        };
    }, []);

    // Get current preview image (either uploaded preview or URL value)
    const currentPreview = preview || value;

    return (
        <div className={cn("space-y-4", className)}>
            {/* URL Input Field */}
            <div className="form-control">
                <Label className="pb-1 flex items-center gap-2">
                    <ImageIcon size={14} className="text-primary" />
                    <span className="font-medium">{label}</span>
                    {required && <span className="badge badge-xs badge-error">Required</span>}
                </Label>
                <Input
                    type="url"
                    value={value}
                    onChange={handleUrlChange}
                    placeholder={placeholder}
                    className="focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    required={required}
                />
            </div>

            {/* Upload Section */}
            <div className="space-y-3">
                <div className="text-sm text-base-content/70">
                    Only images (JPG, PNG, GIF, WebP) up to {maxSizeKB}KB are allowed
                </div>

                {/* Drag and Drop Area */}
                <div
                    className={cn(
                        "relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer",
                        isDragOver
                            ? "border-primary bg-primary/5"
                            : "border-base-300 hover:border-primary/50 hover:bg-base-50",
                        isUploading && "pointer-events-none opacity-50"
                    )}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={handleUploadClick}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPTED_MIME_TYPES.join(',')}
                        onChange={handleFileInputChange}
                        className="hidden"
                        disabled={isUploading}
                    />

                    <div className="flex flex-col items-center justify-center space-y-3">
                        <div className={cn(
                            "p-3 rounded-full transition-colors",
                            isDragOver ? "bg-primary text-white" : "bg-base-200 text-base-content/70"
                        )}>
                            <Upload size={24} />
                        </div>

                        <div className="text-center">
                            <p className="text-sm font-medium">
                                {isDragOver ? "Drop image here" : "Click to upload or drag and drop"}
                            </p>
                            <p className="text-xs text-base-content/60 mt-1">
                                {acceptedFormats.map(f => f.toUpperCase()).join(', ')} up to {maxSizeKB}KB
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isUploading}
                            className="pointer-events-none"
                        >
                            {isUploading ? (
                                <>
                                    <span className="loading loading-spinner loading-xs"></span>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload size={16} />
                                    Choose File
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Upload Progress */}
                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                            <div className="text-center space-y-3">
                                <div className="loading loading-spinner loading-md text-primary"></div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Uploading image...</p>
                                    <div className="w-48 bg-base-200 rounded-full h-2">
                                        <div 
                                            className="bg-primary h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-base-content/60">{uploadProgress}%</p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={cancelUpload}
                                        className="mt-2"
                                    >
                                        Cancel Upload
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Image Preview */}
                {currentPreview && (
                    <div className="relative">
                        <div className="flex items-start gap-3 p-3 bg-base-100 border border-base-200 rounded-lg">
                            <div className="flex-shrink-0">
                                <img
                                    src={currentPreview}
                                    alt="Preview"
                                    className="w-16 h-16 object-cover rounded border"
                                    onError={() => {
                                        setError('Failed to load image preview');
                                        setPreview(null);
                                    }}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-base-content">Current thumbnail</p>
                                <p className="text-xs text-base-content/60 truncate">{currentPreview}</p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleClearPreview}
                                className="flex-shrink-0"
                            >
                                <X size={16} />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Status Messages */}
                {error && (
                    <div className="alert alert-error">
                        <AlertCircle size={16} />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        <CheckCircle2 size={16} />
                        <span className="text-sm">Image uploaded successfully!</span>
                    </div>
                )}
            </div>
        </div>
    );
};