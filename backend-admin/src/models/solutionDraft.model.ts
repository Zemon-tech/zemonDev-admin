import mongoose, { Schema, Document } from 'mongoose';

export interface ISolutionDraft extends Document {
  problemId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  versions: {
    versionId: string;
    content: string;
    description: string;
    createdAt: Date;
  }[];
  status: 'active' | 'archived';
  lastSaved: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SolutionDraftSchema: Schema = new Schema(
  {
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CrucibleProblem',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    versions: [
      {
        versionId: {
          type: String,
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          default: '',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
    lastSaved: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISolutionDraft>('SolutionDraft', SolutionDraftSchema); 