import mongoose, { Schema, Document } from 'mongoose';

interface IDraftVersion {
  content: string;
  timestamp: Date;
  description?: string;
}

export interface ISolutionDraft extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  currentContent: string;
  versions: IDraftVersion[];
  status: 'active' | 'archived';
  lastEdited: Date;
  autoSaveEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SolutionDraftSchema: Schema = new Schema(
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
    currentContent: {
      type: String,
      required: true,
    },
    versions: [
      {
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        description: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
    lastEdited: {
      type: Date,
      default: Date.now,
    },
    autoSaveEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for efficient lookups
SolutionDraftSchema.index({ userId: 1, problemId: 1 });

export default mongoose.model<ISolutionDraft>('SolutionDraft', SolutionDraftSchema); 