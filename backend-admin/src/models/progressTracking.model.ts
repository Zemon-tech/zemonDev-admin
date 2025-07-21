import mongoose, { Schema, Document } from 'mongoose';

interface IMilestone {
  id: string;
  description: string;
  completed: boolean;
  completedAt?: Date;
}

export interface IProgressTracking extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  currentMode: 'understand' | 'brainstorm' | 'draft' | 'review';
  milestones: IMilestone[];
  startTime: Date;
  endTime?: Date;
  timeSpentSeconds: number;
  status: 'in-progress' | 'completed' | 'abandoned';
  createdAt: Date;
  updatedAt: Date;
}

const ProgressTrackingSchema: Schema = new Schema(
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
    currentMode: {
      type: String,
      enum: ['understand', 'brainstorm', 'draft', 'review'],
      default: 'understand',
    },
    milestones: [
      {
        id: { type: String, required: true },
        description: { type: String, required: true },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date },
      },
    ],
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
    },
  },
  { timestamps: true }
);

// Add index for efficient lookups
ProgressTrackingSchema.index({ userId: 1, problemId: 1 });

export default mongoose.model<IProgressTracking>('ProgressTracking', ProgressTrackingSchema); 