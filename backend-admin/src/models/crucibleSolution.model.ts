import mongoose, { Schema, Document } from 'mongoose';

interface IAnalysisResultRef {
  analysisId: mongoose.Types.ObjectId;
  type: 'static' | 'dynamic' | 'complexity' | 'performance' | 'security' | 'custom';
}

interface IReview {
  userId: mongoose.Types.ObjectId;
  rating: number; // e.g., 1-5 stars
  comment?: string;
  reviewedAt: Date;
}

export interface ICrucibleSolution extends Document {
  problemId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  status: 'draft' | 'submitted' | 'reviewed';
  aiAnalysis?: IAnalysisResultRef;
  reviews: IReview[];
  metrics: {
    executionTimeMs?: number;
    memoryUsageBytes?: number;
    score?: number;
  };
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CrucibleSolutionSchema: Schema = new Schema(
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
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'reviewed'],
      default: 'draft',
    },
    aiAnalysis: {
      analysisId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SolutionAnalysis',
      },
      type: {
        type: String,
        enum: ['static', 'dynamic', 'complexity', 'performance', 'security', 'custom'],
      },
    },
    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
        comment: {
          type: String,
        },
        reviewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    metrics: {
      executionTimeMs: {
        type: Number,
      },
      memoryUsageBytes: {
        type: Number,
      },
      score: {
        type: Number,
        min: 0,
        max: 100,
      },
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Add indexes for better query performance
CrucibleSolutionSchema.index({ problemId: 1, userId: 1 });
CrucibleSolutionSchema.index({ submittedAt: -1 });

export default mongoose.model<ICrucibleSolution>('CrucibleSolution', CrucibleSolutionSchema); 