import mongoose, { Schema, Document } from 'mongoose';

export interface IProgressTracking extends Document {
  problemId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  timeSpent: number; // Time in seconds
  milestones: {
    id: string;
    description: string;
    completed: boolean;
    completedAt?: Date;
  }[];
  status: 'not-started' | 'in-progress' | 'completed' | 'abandoned';
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressTrackingSchema: Schema = new Schema(
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
    timeSpent: {
      type: Number,
      default: 0,
    },
    milestones: [
      {
        id: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: {
          type: Date,
        },
      },
    ],
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'abandoned'],
      default: 'not-started',
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IProgressTracking>('ProgressTracking', ProgressTrackingSchema); 