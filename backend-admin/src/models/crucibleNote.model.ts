import mongoose, { Schema, Document } from 'mongoose';

export interface ICrucibleNote extends Document {
  problemId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  tags: string[];
  visibility: 'private' | 'public';
  lastSaved: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CrucibleNoteSchema: Schema = new Schema(
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
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    visibility: {
      type: String,
      enum: ['private', 'public'],
      default: 'private',
    },
    lastSaved: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICrucibleNote>('CrucibleNote', CrucibleNoteSchema); 