import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspaceState extends Document {
  problemId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  layout: {
    showProblemSidebar: boolean;
    showChatSidebar: boolean;
    sidebarWidths: {
      problem: number;
      chat: number;
    };
  };
  activeContent: 'solution' | 'notes';
  currentMode: string;
  editorSettings: {
    fontSize: number;
    theme: string;
    wordWrap: boolean;
    autoSave: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceStateSchema: Schema = new Schema(
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
    layout: {
      showProblemSidebar: {
        type: Boolean,
        default: true,
      },
      showChatSidebar: {
        type: Boolean,
        default: false,
      },
      sidebarWidths: {
        problem: {
          type: Number,
          default: 300,
        },
        chat: {
          type: Number,
          default: 300,
        },
      },
    },
    activeContent: {
      type: String,
      enum: ['solution', 'notes'],
      default: 'solution',
    },
    currentMode: {
      type: String,
      default: 'default',
    },
    editorSettings: {
      fontSize: {
        type: Number,
        default: 14,
      },
      theme: {
        type: String,
        default: 'light',
      },
      wordWrap: {
        type: Boolean,
        default: true,
      },
      autoSave: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IWorkspaceState>('WorkspaceState', WorkspaceStateSchema); 