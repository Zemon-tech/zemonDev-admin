import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  fullName: string;
  username: string; // Clerk username/handle
  collegeDetails?: {
    name?: string;
    branch?: string;
    year?: number;
  };
  profile?: {
    headline?: string;
    bio?: string;
  };
  interests: string[];
  stats: {
    problemsSolved: number;
    resourcesCreated: number;
    reputation: number;
  };
  bookmarkedResources: mongoose.Types.ObjectId[];
  completedSolutions: mongoose.Types.ObjectId[];
  activeDrafts: mongoose.Types.ObjectId[];
  archivedDrafts: mongoose.Types.ObjectId[];
  workspacePreferences: {
    defaultEditorSettings: {
      fontSize: number;
      theme: string;
      wordWrap: boolean;
    };
    defaultLayout: {
      showProblemSidebar: boolean;
      showChatSidebar: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    collegeDetails: {
      name: {
        type: String,
        trim: true,
      },
      branch: {
        type: String,
        trim: true,
      },
      year: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
    profile: {
      headline: {
        type: String,
        trim: true,
      },
      bio: {
        type: String,
        trim: true,
      },
    },
    interests: {
      type: [String],
      default: [],
    },
    stats: {
      problemsSolved: {
        type: Number,
        default: 0,
      },
      resourcesCreated: {
        type: Number,
        default: 0,
      },
      reputation: {
        type: Number,
        default: 0,
      },
    },
    bookmarkedResources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ForgeResource',
      },
    ],
    completedSolutions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CrucibleSolution',
      },
    ],
    activeDrafts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SolutionDraft',
      },
    ],
    archivedDrafts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SolutionDraft',
      },
    ],
    workspacePreferences: {
      defaultEditorSettings: {
        fontSize: {
          type: Number,
          default: 14,
        },
        theme: {
          type: String,
          default: 'system',
        },
        wordWrap: {
          type: Boolean,
          default: true,
        },
      },
      defaultLayout: {
        showProblemSidebar: {
          type: Boolean,
          default: true,
        },
        showChatSidebar: {
          type: Boolean,
          default: true,
        },
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema); 