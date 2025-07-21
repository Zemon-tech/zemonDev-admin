import mongoose, { Schema, Document } from 'mongoose';

interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IAIChatHistory extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  title: string;
  messages: IChatMessage[];
  status: 'active' | 'archived';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AIChatHistorySchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CrucibleProblem',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
    tags: {
        type: [String],
        default: [],
    },
  },
  { timestamps: true }
);

// Index for efficient lookups
AIChatHistorySchema.index({ userId: 1, problemId: 1 });

export default mongoose.model<IAIChatHistory>('AIChatHistory', AIChatHistorySchema); 