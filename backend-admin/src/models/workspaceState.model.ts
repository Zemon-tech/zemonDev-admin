import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspaceState extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  editorContent: string;
  notesContent: string;
  activeTab: 'solution' | 'notes' | 'diagrams' | 'research';
  layoutState: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceStateSchema: Schema = new Schema(
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
    editorContent: {
      type: String,
      default: '',
    },
    notesContent: {
      type: String,
      default: '',
    },
    activeTab: {
      type: String,
      enum: ['solution', 'notes', 'diagrams', 'research'],
      default: 'solution',
    },
    layoutState: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Index for efficient lookups
WorkspaceStateSchema.index({ userId: 1, problemId: 1 });

export default mongoose.model<IWorkspaceState>('WorkspaceState', WorkspaceStateSchema); 