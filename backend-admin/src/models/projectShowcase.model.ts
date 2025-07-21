import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectShowcase extends Document {
  title: string;
  description?: string;
  images: string[];
  gitRepositoryUrl: string;
  demoUrl: string;
  userId: mongoose.Types.ObjectId;
  username: string;
  upvotes: number;
  upvotedBy: mongoose.Types.ObjectId[];
  downvotes: number;
  downvotedBy: mongoose.Types.ObjectId[];
  isApproved: boolean;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectShowcaseSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    gitRepositoryUrl: {
      type: String,
      trim: true,
    },
    demoUrl: {
      type: String,
      trim: true,
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
    upvotes: {
      type: Number,
      default: 0,
    },
    upvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    downvotes: {
      type: Number,
      default: 0,
    },
    downvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isApproved: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Add indexes for better query performance
ProjectShowcaseSchema.index({ submittedAt: -1 }); // Sort by newest first
ProjectShowcaseSchema.index({ upvotes: -1 }); // Sort by most upvoted

export default mongoose.model<IProjectShowcase>('ProjectShowcase', ProjectShowcaseSchema); 