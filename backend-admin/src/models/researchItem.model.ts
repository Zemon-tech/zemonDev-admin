import mongoose, { Schema, Document } from 'mongoose';

export interface IResearchItem extends Document {
  problemId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  type: 'link' | 'note' | 'code' | 'image' | 'document' | 'other';
  content: string;
  url?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ResearchItemSchema: Schema = new Schema(
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
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['link', 'note', 'code', 'image', 'document', 'other'],
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model<IResearchItem>('ResearchItem', ResearchItemSchema); 