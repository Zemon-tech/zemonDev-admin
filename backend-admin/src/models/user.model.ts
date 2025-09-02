import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  fullName: string;
  username: string; // Clerk username/handle
  // New analytics & scoring fields
  stats: {
    problemsSolved: number;
    resourcesCreated: number;
    reputation: number;
    // Added
    totalPoints?: number;
    averageScore?: number;
    highestScore?: number;
    problemsByDifficulty?: {
      easy?: { solved: number; averageScore: number; totalPoints: number };
      medium?: { solved: number; averageScore: number; totalPoints: number };
      hard?: { solved: number; averageScore: number; totalPoints: number };
      expert?: { solved: number; averageScore: number; totalPoints: number };
    };
    problemsByCategory?: Record<string, { solved: number; averageScore: number; totalPoints: number }>;
  };
  skillTracking?: {
    skills: Array<{
      skill: string;
      category: string;
      level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      progress: number;
      problemsSolved: number;
      totalPoints: number;
      averageScore: number;
      lastSolvedAt?: Date;
      lastUpdated: Date;
    }>;
    techStack: Array<{
      technology: string;
      category: string;
      proficiency: number;
      problemsSolved: number;
      totalPoints: number;
      averageScore: number;
      lastUsedAt?: Date;
      lastUpdated: Date;
    }>;
    learningProgress: Array<{
      topic: string;
      category: string;
      mastery: number;
      problemsSolved: number;
      totalPoints: number;
      averageScore: number;
      lastStudiedAt?: Date;
      lastUpdated: Date;
    }>;
  };
  problemHistory?: Array<{
    problemId: mongoose.Types.ObjectId;
    analysisId: mongoose.Types.ObjectId;
    score: number;
    points: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    category: string;
    tags: string[];
    solvedAt: Date;
    reattempts: number;
  }>;
  activeGoal?: {
    role: string;
    title?: string;
    focusSkills?: string[];
    startedAt?: Date;
    targetDate?: Date;
  };
  goalsHistory?: Array<{
    role: string;
    title?: string;
    achievedAt?: Date;
    outcome?: 'completed' | 'abandoned' | 'switched';
  }>;
  activityLog?: Array<{
    type: 'problem_solved' | 'resource_viewed' | 'bookmark_added' | 'streak_visit' | 'hackathon_submission';
    points?: number;
    category?: string;
    occurredAt: Date;
    meta?: Record<string, any>;
  }>;
  dailyStats?: Array<{
    date: string; // YYYY-MM-DD
    points: number;
    problemsSolved: number;
  }>;
  learningPatterns?: {
    timeOfDayPerformance?: { morning?: number; afternoon?: number; evening?: number; night?: number };
    difficultyPerformance?: { easy?: number; medium?: number; hard?: number; expert?: number };
    categoryPerformance?: Record<string, number>;
  };
  roleMatch?: {
    targetRole?: string;
    matchPercent?: number;
    gaps?: Array<{ skill: string; requiredLevel: number; currentLevel: number }>;
    lastComputedAt?: Date;
  };
  comparisons?: {
    communityPercentile?: number;
    cohort?: string;
    lastComputedAt?: Date;
  };
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
  bookmarkedResources: mongoose.Types.ObjectId[];
  completedSolutions: mongoose.Types.ObjectId[];
  activeDrafts: mongoose.Types.ObjectId[];
  archivedDrafts: mongoose.Types.ObjectId[];
  milestones: mongoose.Types.ObjectId[];
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
      problemsSolved: { type: Number, default: 0 },
      resourcesCreated: { type: Number, default: 0 },
      reputation: { type: Number, default: 0 },
      totalPoints: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      highestScore: { type: Number, default: 0 },
      problemsByDifficulty: {
        easy: {
          solved: { type: Number, default: 0 },
          averageScore: { type: Number, default: 0 },
          totalPoints: { type: Number, default: 0 },
        },
        medium: {
          solved: { type: Number, default: 0 },
          averageScore: { type: Number, default: 0 },
          totalPoints: { type: Number, default: 0 },
        },
        hard: {
          solved: { type: Number, default: 0 },
          averageScore: { type: Number, default: 0 },
          totalPoints: { type: Number, default: 0 },
        },
        expert: {
          solved: { type: Number, default: 0 },
          averageScore: { type: Number, default: 0 },
          totalPoints: { type: Number, default: 0 },
        },
      },
      problemsByCategory: {
        type: Map,
        of: {
          solved: { type: Number, default: 0 },
          averageScore: { type: Number, default: 0 },
          totalPoints: { type: Number, default: 0 },
        },
        default: {},
      },
    },
    skillTracking: {
      skills: {
        type: [
          {
            skill: { type: String, required: true },
            category: { type: String, required: true },
            level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], required: true },
            progress: { type: Number, default: 0 },
            problemsSolved: { type: Number, default: 0 },
            totalPoints: { type: Number, default: 0 },
            averageScore: { type: Number, default: 0 },
            lastSolvedAt: { type: Date },
            lastUpdated: { type: Date, default: Date.now },
          },
        ],
        default: [],
      },
      techStack: {
        type: [
          {
            technology: { type: String, required: true },
            category: { type: String, required: true },
            proficiency: { type: Number, default: 0 },
            problemsSolved: { type: Number, default: 0 },
            totalPoints: { type: Number, default: 0 },
            averageScore: { type: Number, default: 0 },
            lastUsedAt: { type: Date },
            lastUpdated: { type: Date, default: Date.now },
          },
        ],
        default: [],
      },
      learningProgress: {
        type: [
          {
            topic: { type: String, required: true },
            category: { type: String, required: true },
            mastery: { type: Number, default: 0 },
            problemsSolved: { type: Number, default: 0 },
            totalPoints: { type: Number, default: 0 },
            averageScore: { type: Number, default: 0 },
            lastStudiedAt: { type: Date },
            lastUpdated: { type: Date, default: Date.now },
          },
        ],
        default: [],
      },
    },
    problemHistory: {
      type: [
        {
          problemId: { type: mongoose.Schema.Types.ObjectId, required: true },
          analysisId: { type: mongoose.Schema.Types.ObjectId, required: true },
          score: { type: Number, required: true },
          points: { type: Number, required: true },
          difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'expert'], required: true },
          category: { type: String, required: true },
          tags: { type: [String], default: [] },
          solvedAt: { type: Date, required: true },
          reattempts: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    activeGoal: {
      role: { type: String },
      title: { type: String },
      focusSkills: { type: [String], default: [] },
      startedAt: { type: Date },
      targetDate: { type: Date },
    },
    goalsHistory: {
      type: [
        {
          role: { type: String, required: true },
          title: { type: String },
          achievedAt: { type: Date },
          outcome: { type: String, enum: ['completed', 'abandoned', 'switched'] },
        },
      ],
      default: [],
    },
    activityLog: {
      type: [
        {
          type: { type: String, enum: ['problem_solved', 'resource_viewed', 'bookmark_added', 'streak_visit', 'hackathon_submission'], required: true },
          points: { type: Number },
          category: { type: String },
          occurredAt: { type: Date, required: true },
          meta: { type: Schema.Types.Mixed },
        },
      ],
      default: [],
    },
    dailyStats: {
      type: [
        {
          date: { type: String, required: true },
          points: { type: Number, default: 0 },
          problemsSolved: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    learningPatterns: {
      timeOfDayPerformance: {
        morning: { type: Number, default: 0 },
        afternoon: { type: Number, default: 0 },
        evening: { type: Number, default: 0 },
        night: { type: Number, default: 0 },
      },
      difficultyPerformance: {
        easy: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        hard: { type: Number, default: 0 },
        expert: { type: Number, default: 0 },
      },
      categoryPerformance: {
        type: Map,
        of: Number,
        default: {},
      },
    },
    roleMatch: {
      targetRole: { type: String },
      matchPercent: { type: Number, default: 0 },
      gaps: {
        type: [
          {
            skill: { type: String, required: true },
            requiredLevel: { type: Number, required: true },
            currentLevel: { type: Number, required: true },
          },
        ],
        default: [],
      },
      lastComputedAt: { type: Date },
    },
    comparisons: {
      communityPercentile: { type: Number, default: 0 },
      cohort: { type: String },
      lastComputedAt: { type: Date },
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
    milestones: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Milestone',
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

// Indexes for analytics
UserSchema.index({ 'problemHistory.solvedAt': 1 });
UserSchema.index({ 'stats.totalPoints': -1 });
UserSchema.index({ 'dailyStats.date': 1 });

export default mongoose.model<IUser>('User', UserSchema); 