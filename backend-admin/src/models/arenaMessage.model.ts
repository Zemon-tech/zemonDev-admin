import mongoose, { Schema, Document } from 'mongoose';

export interface IArenaMessage extends Document {
  channelId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  username: string;
  content: string;
  type: 'text' | 'system';
  replyToId?: mongoose.Types.ObjectId;
  mentions: mongoose.Types.ObjectId[];
  timestamp: Date;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
}

const ArenaMessageSchema: Schema = new Schema(
  {
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ArenaChannel',
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
    content: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['text', 'system'],
      default: 'text',
    },
    replyToId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ArenaMessage',
    },
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Add indexes for better query performance
ArenaMessageSchema.index({ channelId: 1, timestamp: -1 });
ArenaMessageSchema.index({ userId: 1 });
ArenaMessageSchema.index({ mentions: 1 });

export default mongoose.model<IArenaMessage>('ArenaMessage', ArenaMessageSchema); 