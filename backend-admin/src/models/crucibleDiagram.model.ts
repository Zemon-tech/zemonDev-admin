import mongoose, { Schema, Document } from 'mongoose';

export interface ICrucibleDiagram extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  title: string;
  type: 'architecture' | 'flowchart' | 'er-diagram' | 'sequence' | 'other';
  content: string;
  thumbnail: string;
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const CrucibleDiagramSchema: Schema = new Schema(
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
      enum: ['architecture', 'flowchart', 'er-diagram', 'sequence', 'other'],
      default: 'flowchart',
    },
    content: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default: '',
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
CrucibleDiagramSchema.index({ userId: 1, problemId: 1 });

export default mongoose.model<ICrucibleDiagram>('CrucibleDiagram', CrucibleDiagramSchema); 