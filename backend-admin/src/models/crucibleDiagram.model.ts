import mongoose, { Schema, Document } from 'mongoose';

export interface ICrucibleDiagram extends Document {
  problemId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  type: 'flowchart' | 'sequence' | 'class' | 'entity' | 'state' | 'gantt' | 'other';
  content: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const CrucibleDiagramSchema: Schema = new Schema(
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
      enum: ['flowchart', 'sequence', 'class', 'entity', 'state', 'gantt', 'other'],
      default: 'flowchart',
    },
    content: {
      type: String,
      required: [true, 'Diagram content is required'],
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICrucibleDiagram>('CrucibleDiagram', CrucibleDiagramSchema); 