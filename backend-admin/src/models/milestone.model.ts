import mongoose, { Schema, Document } from 'mongoose';

export interface IMilestone extends Document {
  name: string;
  description: string;
  category: 'problemsSolved' | 'resourcesCreated' | 'reputation' | 'streak' | 'collaboration';
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  requirement: {
    type: 'problemsSolved' | 'resourcesCreated' | 'reputation' | 'streak' | 'collaboration';
    value: number;
  };
  points: number;
  iconUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['problemsSolved', 'resourcesCreated', 'reputation', 'streak', 'collaboration'],
    },
    level: {
      type: String,
      required: true,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    },
    requirement: {
      type: {
        type: String,
        required: true,
        enum: ['problemsSolved', 'resourcesCreated', 'reputation', 'streak', 'collaboration'],
      },
      value: {
        type: Number,
        required: true,
        min: 1,
      },
    },
    points: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    iconUrl: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
MilestoneSchema.index({ category: 1, level: 1, isActive: 1 });
MilestoneSchema.index({ 'requirement.type': 1, isActive: 1 });

export default mongoose.model<IMilestone>('Milestone', MilestoneSchema);
