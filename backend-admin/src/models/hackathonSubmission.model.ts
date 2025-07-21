import mongoose, { Schema, Document } from 'mongoose';

export interface IHackathonSubmission extends Document {
  hackathonId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  username: string;
  solution: string;
  codeFiles?: string[];
  demoUrl?: string;
  explanation: string;
  submittedAt: Date;
  score?: number;
  feedback?: string;
  isWinner: boolean;
  position?: number;
}

const HackathonSubmissionSchema: Schema = new Schema(
  {
    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WeeklyHackathon',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    solution: {
      type: String,
      required: true,
    },
    codeFiles: {
      type: [String],
      default: [],
    },
    demoUrl: {
      type: String,
      trim: true,
    },
    explanation: {
      type: String,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    feedback: {
      type: String,
    },
    isWinner: {
      type: Boolean,
      default: false,
    },
    position: {
      type: Number,
      min: 1,
    },
  },
  { timestamps: true }
);

// Add indexes for better query performance
HackathonSubmissionSchema.index({ hackathonId: 1, score: -1 });
HackathonSubmissionSchema.index({ userId: 1, hackathonId: 1 }, { unique: true });

export default mongoose.model<IHackathonSubmission>('HackathonSubmission', HackathonSubmissionSchema); 