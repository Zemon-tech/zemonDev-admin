import mongoose, { Schema, Document } from 'mongoose';

export interface ICrucibleNote extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  content: string;
  tags: string[];
  status: 'active' | 'archived';
  visibility: 'private' | 'public' | 'community';
  createdAt: Date;
  updatedAt: Date;
}

const CrucibleNoteSchema: Schema = new Schema(
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
    content: {
      type: String,
      required: true,
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
    visibility: {
      type: String,
      enum: ['private', 'public', 'community'],
      default: 'private',
    },
  },
  { timestamps: true }
);

// Index for efficient lookups
CrucibleNoteSchema.index({ userId: 1, problemId: 1 });
CrucibleNoteSchema.index({ problemId: 1, visibility: 1 });

export default mongoose.model<ICrucibleNote>('CrucibleNote', CrucibleNoteSchema); 