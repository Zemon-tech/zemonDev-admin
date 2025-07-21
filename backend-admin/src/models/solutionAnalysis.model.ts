import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalysisParameter {
  name: string;
  score: number; // Score out of 100
  justification: string; // AI's reasoning for this score
}

export interface ISolutionAnalysisResult extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  overallScore: number;
  aiConfidence: number; // A score from 0-100 on how confident the AI is
  summary: string;
  evaluatedParameters: IAnalysisParameter[];
  feedback: {
    strengths: string[];
    areasForImprovement: string[];
    suggestions: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const AnalysisParameterSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  justification: {
    type: String,
    required: true,
  },
});

const SolutionAnalysisSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CrucibleProblem',
      required: true,
      index: true,
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    aiConfidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    summary: {
      type: String,
      required: true,
    },
    evaluatedParameters: {
      type: [AnalysisParameterSchema],
      required: true,
      default: [],
    },
    feedback: {
      strengths: {
        type: [String],
        default: [],
      },
      areasForImprovement: {
        type: [String],
        default: [],
      },
      suggestions: {
        type: [String],
        default: [],
      },
    },
  },
  { timestamps: true }
);

// Add indexes for better query performance
SolutionAnalysisSchema.index({ createdAt: -1 });
SolutionAnalysisSchema.index({ userId: 1, problemId: 1 });

export default mongoose.model<ISolutionAnalysisResult>('SolutionAnalysis', SolutionAnalysisSchema); 