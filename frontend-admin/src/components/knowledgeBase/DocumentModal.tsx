import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Upload } from 'lucide-react';
import type { KnowledgeBaseDocument } from '../../services/knowledgeBaseApi';
import { createKnowledgeBaseDocument, updateKnowledgeBaseDocument } from '../../services/knowledgeBaseApi';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: (refreshNeeded?: boolean) => void;
  document: KnowledgeBaseDocument | null;
}

const DocumentModal: React.FC<DocumentModalProps> = ({ isOpen, onClose, document }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [documentType, setDocumentType] = useState<KnowledgeBaseDocument['documentType']>('text');
  const [sourceUrl, setSourceUrl] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens/closes or document changes
  useEffect(() => {
    if (isOpen) {
      if (document) {
        // Edit mode - populate form with document data
        setTitle(document.title);
        setContent(document.content);
        setDocumentType(document.documentType);
        setSourceUrl(document.sourceUrl || '');
        setCategory(document.category || '');
        setTags(document.tags ? document.tags.join(', ') : '');
        setFile(null);
      } else {
        // Add mode - reset form
        setTitle('');
        setContent('');
        setDocumentType('text');
        setSourceUrl('');
        setCategory('');
        setTags('');
        setFile(null);
      }
      setError(null);
    }
  }, [isOpen, document]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // If PDF, set document type accordingly
      if (selectedFile.type === 'application/pdf') {
        setDocumentType('pdf');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert tags string to array
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('title', title);
      
      if (file) {
        // If we have a file, we'll handle it differently based on type
        if (documentType === 'pdf') {
          // For PDFs, we'll read as base64 and send that as content
          const reader = new FileReader();
          reader.onload = async () => {
            const base64String = reader.result as string;
            formData.append('content', base64String.split(',')[1]); // Remove data URL prefix
            formData.append('documentType', documentType);
            formData.append('sourceUrl', sourceUrl);
            formData.append('category', category);
            tagsArray.forEach(tag => formData.append('tags[]', tag));
            
            await saveDocument(formData);
          };
          reader.readAsDataURL(file);
          return; // Early return since we're handling this asynchronously
        } else {
          // For other file types, read as text
          const reader = new FileReader();
          reader.onload = async () => {
            formData.append('content', reader.result as string);
            formData.append('documentType', documentType);
            formData.append('sourceUrl', sourceUrl);
            formData.append('category', category);
            tagsArray.forEach(tag => formData.append('tags[]', tag));
            
            await saveDocument(formData);
          };
          reader.readAsText(file);
          return; // Early return since we're handling this asynchronously
        }
      } else {
        // No file, just use the content from textarea
        formData.append('content', content);
        formData.append('documentType', documentType);
        formData.append('sourceUrl', sourceUrl);
        formData.append('category', category);
        tagsArray.forEach(tag => formData.append('tags[]', tag));
        
        await saveDocument(formData);
      }
    } catch (err) {
      console.error('Error preparing document data:', err);
      setError('Failed to prepare document data. Please try again.');
      setLoading(false);
    }
  };

  const saveDocument = async (formData: FormData) => {
    try {
      if (document?._id) {
        // Update existing document
        await updateKnowledgeBaseDocument(document._id, formData);
      } else {
        // Create new document
        await createKnowledgeBaseDocument(formData);
      }
      
      onClose(true); // Close modal and refresh the document list
    } catch (err) {
      console.error('Error saving document:', err);
      setError('Failed to save document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-base-300">
          <h3 className="text-lg font-bold">
            {document ? 'Edit Document' : 'Add New Document'}
          </h3>
          <button onClick={() => onClose()} className="btn btn-sm btn-ghost">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-4">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium">Title</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Document Type</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as KnowledgeBaseDocument['documentType'])}
                  required
                >
                  <option value="text">Text</option>
                  <option value="markdown">Markdown</option>
                  <option value="pdf">PDF</option>
                  <option value="webpage">Webpage</option>
                  <option value="code_snippet">Code Snippet</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Category</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Crucible Problem, Algorithm Theory"
                />
              </div>
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium">Source URL (Optional)</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://example.com/resource"
              />
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium">Tags (comma-separated)</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., algorithm, data structure, sorting"
              />
            </div>

            {documentType === 'pdf' ? (
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">Upload PDF</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="file-input file-input-bordered w-full"
                  />
                </div>
                {file && (
                  <p className="text-sm mt-2">Selected file: {file.name}</p>
                )}
              </div>
            ) : (
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">Content</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-40"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter document content here..."
                  required={!file}
                ></textarea>
                <div className="mt-2 flex items-center">
                  <span className="text-sm text-base-content/70 mr-2">Or upload a file:</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="file-input file-input-bordered file-input-sm"
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="border-t border-base-300 p-4 flex justify-end gap-2">
          <button
            onClick={() => onClose()}
            className="btn btn-ghost"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={loading || !title || (!content && !file)}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Document
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentModal; 