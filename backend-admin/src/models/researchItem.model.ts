import mongoose, { Schema, Document } from 'mongoose';

export interface IResearchItem extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  title: string;
  type: 'article' | 'code-snippet' | 'documentation' | 'video' | 'other';
  content: string;
  notes: string;
  tags: string[];
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const ResearchItemSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CrucibleProblem',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['article', 'code-snippet', 'documentation', 'video', 'other'],
      default: 'article',
    },
    content: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Index for efficient lookups
ResearchItemSchema.index({ userId: 1, problemId: 1 });

export default mongoose.model<IResearchItem>('ResearchItem', ResearchItemSchema); 