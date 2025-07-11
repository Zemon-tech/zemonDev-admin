import api from './api';

const KNOWLEDGE_BASE_URL = '/admin/knowledge-base/documents';

export interface KnowledgeBaseDocument {
  _id?: string;
  title: string;
  content: string;
  documentType: 'text' | 'markdown' | 'pdf' | 'webpage' | 'code_snippet' | 'json';
  sourceUrl?: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, string>;
  vectorId?: string;
  isIndexed: boolean;
  lastIndexedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface KnowledgeBaseResponse {
  documents: KnowledgeBaseDocument[];
  page: number;
  pages: number;
  total: number;
}

// Create a new knowledge base document
export const createKnowledgeBaseDocument = async (data: FormData | KnowledgeBaseDocument) => {
  const response = await api.post(KNOWLEDGE_BASE_URL, data);
  return response.data;
};

// Get all knowledge base documents (paginated)
export const getKnowledgeBaseDocuments = async (page = 1, limit = 10) => {
  const response = await api.get(`${KNOWLEDGE_BASE_URL}?page=${page}&limit=${limit}`);
  return response.data as KnowledgeBaseResponse;
};

// Get a single knowledge base document by ID
export const getKnowledgeBaseDocumentById = async (id: string) => {
  const response = await api.get(`${KNOWLEDGE_BASE_URL}/${id}`);
  return response.data as KnowledgeBaseDocument;
};

// Update a knowledge base document
export const updateKnowledgeBaseDocument = async (id: string, data: FormData | Partial<KnowledgeBaseDocument>) => {
  const response = await api.put(`${KNOWLEDGE_BASE_URL}/${id}`, data);
  return response.data as KnowledgeBaseDocument;
};

// Delete a knowledge base document
export const deleteKnowledgeBaseDocument = async (id: string) => {
  const response = await api.delete(`${KNOWLEDGE_BASE_URL}/${id}`);
  return response.data;
}; 