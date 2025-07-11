import React, { useState, useEffect } from 'react';
import { getKnowledgeBaseDocuments, deleteKnowledgeBaseDocument } from '../services/knowledgeBaseApi';
import type { KnowledgeBaseDocument } from '../services/knowledgeBaseApi';
import { Plus, Edit, Trash2, Search, FileText, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DocumentModal from '../components/knowledgeBase/DocumentModal';

const KnowledgeBasePage: React.FC = () => {
  const [documents, setDocuments] = useState<KnowledgeBaseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<KnowledgeBaseDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await getKnowledgeBaseDocuments(page);
      setDocuments(response.documents);
      setTotalPages(response.pages);
      setTotalDocuments(response.total);
      setError(null);
    } catch (err) {
      setError('Failed to fetch documents. Please try again.');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document? This will also remove it from the vector database.')) {
      try {
        await deleteKnowledgeBaseDocument(id);
        fetchDocuments(); // Refresh the list
      } catch (err) {
        setError('Failed to delete document. Please try again.');
        console.error('Error deleting document:', err);
      }
    }
  };

  const handleEdit = (document: KnowledgeBaseDocument) => {
    setCurrentDocument(document);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setCurrentDocument(null);
    setIsModalOpen(true);
  };

  const handleModalClose = (refreshNeeded: boolean = false) => {
    setIsModalOpen(false);
    if (refreshNeeded) {
      fetchDocuments();
    }
  };

  const filteredDocuments = searchTerm
    ? documents.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (doc.category && doc.category.toLowerCase().includes(searchTerm.toLowerCase())))
    : documents;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Knowledge Base Management</h1>
        <button
          onClick={handleAddNew}
          className="btn btn-primary gap-2"
        >
          <Plus size={18} />
          Add New Document
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 bg-base-200 p-3 rounded-lg">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
          <input
            type="text"
            placeholder="Search by title or category..."
            className="input input-bordered w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Documents Table */}
      <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Category</th>
              <th>Last Indexed</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  <span className="loading loading-spinner loading-md"></span>
                </td>
              </tr>
            ) : filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  <div className="flex flex-col items-center gap-2">
                    <FileText size={24} className="text-base-content/40" />
                    <p className="text-base-content/60">No documents found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredDocuments.map((doc) => (
                <tr key={doc._id} className="hover">
                  <td className="font-medium">{doc.title}</td>
                  <td>
                    <span className="badge badge-outline">{doc.documentType}</span>
                  </td>
                  <td>{doc.category || 'N/A'}</td>
                  <td>{formatDate(doc.lastIndexedAt)}</td>
                  <td>
                    {doc.isIndexed ? (
                      <span className="badge badge-success badge-sm gap-1">
                        Indexed
                      </span>
                    ) : (
                      <span className="badge badge-warning badge-sm gap-1">
                        Not Indexed
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(doc)}
                        className="btn btn-sm btn-ghost"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(doc._id!)}
                        className="btn btn-sm btn-ghost text-error"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="join">
            <button
              className="join-item btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              «
            </button>
            <button className="join-item btn">
              Page {page} of {totalPages}
            </button>
            <button
              className="join-item btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* Document Modal */}
      <DocumentModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        document={currentDocument}
      />
    </div>
  );
};

export default KnowledgeBasePage; 