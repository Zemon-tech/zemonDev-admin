import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Save, ArrowLeft, FileText, Layers, Tag, Link2, MessageSquare, Edit } from 'lucide-react';
import type { KnowledgeBaseDocument } from '../services/knowledgeBaseApi';
import { 
  createKnowledgeBaseDocument, 
  updateKnowledgeBaseDocument, 
  getKnowledgeBaseDocumentById 
} from '../services/knowledgeBaseApi';

const KnowledgeBaseEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [documentType, setDocumentType] = useState<KnowledgeBaseDocument['documentType']>('text');
  const [sourceUrl, setSourceUrl] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch document data if in edit mode
    const fetchDocument = async () => {
      if (id) {
        try {
          setIsLoading(true);
          const document = await getKnowledgeBaseDocumentById(id);
          setTitle(document.title);
          setContent(document.content);
          setDocumentType(document.documentType);
          setSourceUrl(document.sourceUrl || '');
          setCategory(document.category || '');
          setTags(document.tags ? document.tags.join(', ') : '');
          setError(null);
        } catch (err) {
          console.error('Error fetching document:', err);
          setError('Failed to load document. Please try again.');
          navigate('/admin/knowledge-base');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchDocument();
  }, [id, navigate]);

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
      if (isEditMode && id) {
        // Update existing document
        await updateKnowledgeBaseDocument(id, formData);
      } else {
        // Create new document
        await createKnowledgeBaseDocument(formData);
      }
      
      navigate('/admin/knowledge-base');
    } catch (err) {
      console.error('Error saving document:', err);
      setError('Failed to save document. Please try again.');
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center py-1 px-4 border-b border-base-200 bg-base-100">
        <div>
          <h1 className="text-xl font-bold text-primary">Edit Document</h1>
          <p className="text-xs text-base-content/70">Update an existing knowledge base document</p>
        </div>
        <Link 
          to="/admin/knowledge-base" 
          className="btn btn-ghost btn-sm gap-1"
        >
          <ArrowLeft size={16} />
          Back to List
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-auto">
        <div className="bg-base-200/60 py-2 px-4 border-b border-base-300 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
              <Edit size={16} />
            </div>
            <div>
              <h2 className="font-bold text-sm">Edit Knowledge Document</h2>
              <p className="text-xs text-base-content/70">Update content in your knowledge base</p>
            </div>
          </div>
          {documentType && (
            <div className="badge badge-primary badge-sm">
              {documentType.charAt(0).toUpperCase() + documentType.slice(1)}
            </div>
          )}
        </div>

        {error && (
          <div className="alert alert-error mx-4 my-1 py-1 text-sm">
            <span>{error}</span>
          </div>
        )}

        <div className="flex-1 overflow-auto p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 auto-rows-max">
            <div className="space-y-4">
              <div className="form-control bg-base-100 rounded-lg border border-base-200 p-3 transition-all hover:border-primary/30">
                <label className="label pb-1 flex items-center gap-2">
                  <FileText size={14} className="text-primary" />
                  <span className="label-text font-medium">Title</span>
                  <span className="badge badge-xs badge-error">Required</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input input-bordered focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Enter a descriptive title"
                  required
                />
              </div>

              <div className="form-control bg-base-100 rounded-lg border border-base-200 p-3 transition-all hover:border-primary/30">
                <label className="label pb-1 flex items-center gap-2">
                  <Layers size={14} className="text-primary" />
                  <span className="label-text font-medium">Document Type</span>
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as KnowledgeBaseDocument['documentType'])}
                  className="select select-bordered focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                >
                  <option value="text">Text</option>
                  <option value="markdown">Markdown</option>
                  <option value="pdf">PDF</option>
                  <option value="webpage">Webpage</option>
                  <option value="code_snippet">Code Snippet</option>
                  <option value="json">JSON</option>
                </select>
                <label className="label pt-1">
                  <span className="label-text-alt text-base-content/70">Select the type of document you're adding</span>
                </label>
              </div>

              <div className="form-control bg-base-100 rounded-lg border border-base-200 p-3 transition-all hover:border-primary/30">
                <label className="label pb-1 flex items-center gap-2">
                  <Tag size={14} className="text-primary" />
                  <span className="label-text font-medium">Category</span>
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input input-bordered focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="e.g., Crucible Problem, Algorithm Theory"
                />
                <label className="label pt-1">
                  <span className="label-text-alt text-base-content/70">Categorize your document for better organization</span>
                </label>
              </div>

              <div className="form-control bg-base-100 rounded-lg border border-base-200 p-3 transition-all hover:border-primary/30">
                <label className="label pb-1 flex items-center gap-2">
                  <Link2 size={14} className="text-primary" />
                  <span className="label-text font-medium">Source URL (Optional)</span>
                </label>
                <input
                  type="text"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="input input-bordered focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="https://example.com/resource"
                />
                <label className="label pt-1">
                  <span className="label-text-alt text-base-content/70">Link to the original source if applicable</span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="form-control bg-base-100 rounded-lg border border-base-200 p-3 transition-all hover:border-primary/30">
                <label className="label pb-1 flex items-center gap-2">
                  <Tag size={14} className="text-primary" />
                  <span className="label-text font-medium">Tags (comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="input input-bordered focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="e.g., algorithm, data structure, sorting"
                />
                <label className="label pt-1">
                  <span className="label-text-alt text-base-content/70">Add tags to make your document easier to find</span>
                </label>
              </div>

              {documentType === 'pdf' ? (
                <div className="form-control bg-base-100 rounded-lg border border-base-200 p-3 transition-all hover:border-primary/30">
                  <label className="label pb-1 flex items-center gap-2">
                    <FileText size={14} className="text-primary" />
                    <span className="label-text font-medium">Upload PDF</span>
                    <span className="badge badge-xs badge-error">Required</span>
                  </label>
                  <div className="relative">
                    <div className="absolute top-2 left-2 opacity-30 pointer-events-none">
                      <FileText size={60} className="text-primary/10" />
                    </div>
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
                <div className="form-control bg-base-100 rounded-lg border border-base-200 p-3 transition-all hover:border-primary/30">
                  <label className="label pb-1 flex items-center gap-2">
                    <MessageSquare size={14} className="text-primary" />
                    <span className="label-text font-medium">Content</span>
                    <span className="badge badge-xs badge-error">Required</span>
                  </label>
                  <div className="relative">
                    <div className="absolute top-2 left-2 opacity-30 pointer-events-none">
                      <MessageSquare size={60} className="text-primary/10" />
                    </div>
                    <textarea
                      className="textarea textarea-bordered min-h-[300px] focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y w-full"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Enter document content here..."
                      required={!file}
                    ></textarea>
                  </div>
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
            </div>
          </div>
        </div>

        <div className="p-2 border-t border-base-200 flex justify-end bg-base-100">
          <button
            type="submit"
            className="btn btn-primary btn-sm gap-2"
            disabled={loading || !title || (!content && !file)}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Saving...
              </>
            ) : (
              <>
                <Save size={14} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default KnowledgeBaseEditPage; 