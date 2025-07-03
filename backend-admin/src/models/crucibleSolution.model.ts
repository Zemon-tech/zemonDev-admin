import mongoose, { Schema, Document } from 'mongoose';

interface Review {
  userId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface ICrucibleSolution extends Document {
  problemId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  status: 'draft' | 'submitted' | 'reviewed';
  aiAnalysis: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  reviews: Review[];
  metrics: {
    upvotes: number;
    downvotes: number;
    views: number;
  };
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
      required: [true, 'Solution content is required'],
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'reviewed'],
      default: 'draft',
    },
    aiAnalysis: {
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      feedback: {
        type: String,
        default: '',
      },
      suggestions: {
        type: [String],
        default: [],
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
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    metrics: {
      upvotes: {
        type: Number,
        default: 0,
      },
      downvotes: {
        type: Number,
        default: 0,
      },
      views: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICrucibleSolution>('CrucibleSolution', CrucibleSolutionSchema); 