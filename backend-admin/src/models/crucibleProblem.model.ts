import mongoose, { Schema, Document } from 'mongoose';

export interface ICrucibleProblem extends Document {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  tags: string[];
  requirements: {
    functional: string[];
    nonFunctional: string[];
  };
  constraints: string[];
  expectedOutcome: string;
  hints: string[];
  createdBy: mongoose.Types.ObjectId;
  metrics: {
    attempts: number;
    solutions: number;
    successRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CrucibleProblemSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'expert'],
      default: 'medium',
    },
    tags: {
      type: [String],
      default: [],
    },
    requirements: {
      functional: {
        type: [String],
        default: [],
      },
      nonFunctional: {
        type: [String],
        default: [],
      },
    },
    constraints: {
      type: [String],
      default: [],
    },
    expectedOutcome: {
      type: String,
      required: [true, 'Please provide the expected outcome'],
    },
    hints: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    metrics: {
      attempts: {
        type: Number,
        default: 0,
      },
      solutions: {
        type: Number,
        default: 0,
      },
      successRate: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICrucibleProblem>('CrucibleProblem', CrucibleProblemSchema); 