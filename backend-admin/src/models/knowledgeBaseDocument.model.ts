import mongoose, { Schema, Document } from 'mongoose';

export interface IKnowledgeBaseDocument extends Document {
  title: string;
  content: string;
  documentType: 'text' | 'markdown' | 'pdf' | 'webpage' | 'code_snippet' | 'json';
  sourceUrl?: string;
  category?: string;
  tags?: string[];
  metadata?: Map<string, string>;
  vectorId?: string;
  isIndexed: boolean;
  lastIndexedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeBaseDocumentSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    documentType: {
      type: String,
      enum: ['text', 'markdown', 'pdf', 'webpage', 'code_snippet', 'json'],
      required: true,
    },
    sourceUrl: {
      type: String,
    },
    category: {
      type: String,
    },
    tags: [{
      type: String,
    }],
    metadata: {
      type: Map,
      of: String,
    },
    vectorId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isIndexed: {
      type: Boolean,
      default: false,
    },
    lastIndexedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IKnowledgeBaseDocument>('KnowledgeBaseDocument', KnowledgeBaseDocumentSchema); 