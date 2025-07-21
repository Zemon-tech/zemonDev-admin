import mongoose, { Schema, Document } from 'mongoose';

export interface IArenaChannel extends Document {
  name: string;
  type: 'text' | 'announcement' | 'readonly';
  group: 'getting-started' | 'community' | 'hackathons';
  description?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  moderators: mongoose.Types.ObjectId[];
  permissions: {
    canMessage: boolean;
    canRead: boolean;
  };
  parentChannelId?: mongoose.Types.ObjectId | null;
}

const ArenaChannelSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['text', 'announcement', 'readonly'],
      default: 'text',
    },
    group: {
      type: String,
      required: true,
      enum: ['getting-started', 'community', 'hackathons'],
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    moderators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    permissions: {
      canMessage: {
        type: Boolean,
        default: true,
      },
      canRead: {
        type: Boolean,
        default: true,
      },
    },
    parentChannelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ArenaChannel',
      default: null,
    },
  },
  { timestamps: true }
);

// Add index for better query performance
ArenaChannelSchema.index({ group: 1, name: 1 });
ArenaChannelSchema.index({ isActive: 1 });

export default mongoose.model<IArenaChannel>('ArenaChannel', ArenaChannelSchema); 