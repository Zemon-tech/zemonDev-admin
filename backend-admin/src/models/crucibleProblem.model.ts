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
  learningObjectives: string[];
  prerequisites: string[];
  userPersonas: string[];
  resources: {
    title: string;
    url: string;
    type: 'article' | 'video' | 'documentation' | 'tool' | 'other';
  }[];
  aiHints: {
    trigger: string;
    content: string;
  }[];
  status: 'draft' | 'published' | 'archived';
  createdBy: mongoose.Types.ObjectId;
  metrics: {
    attempts: number;
    solutions: number;
    successRate: number;
    averageTimeSpent: number;
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
    learningObjectives: {
      type: [String],
      default: [],
    },
    prerequisites: {
      type: [String],
      default: [],
    },
    userPersonas: {
      type: [String],
      default: [],
    },
    resources: [
      {
        title: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['article', 'video', 'documentation', 'tool', 'other'],
          default: 'article',
        },
      },
    ],
    aiHints: [
      {
        trigger: {
          type: String,
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
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
      averageTimeSpent: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICrucibleProblem>('CrucibleProblem', CrucibleProblemSchema); 