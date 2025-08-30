import mongoose, { Schema, Document } from 'mongoose';

interface IPrerequisite {
  name: string;
  link?: string;
}

interface IRelatedResource {
  title: string;
  link: string;
}

interface ICommunityTip {
  content: string;
  author: string;
}

interface IRequirement {
  requirement: string;
  context: string;
}

export interface ICrucibleProblem extends Document {
  title: string;
  description: string;
  thumbnailUrl?: string;
  category: 'algorithms' | 'system-design' | 'web-development' | 'mobile-development' | 'data-science' | 'devops' | 'frontend' | 'backend';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  tags: string[];
  requirements: {
    functional: IRequirement[];
    nonFunctional: IRequirement[];
  };
  constraints: string[];
  expectedOutcome: string;
  hints: string[];
  learningObjectives?: string[];
  prerequisites?: IPrerequisite[];
  userPersona?: { name: string; journey: string };
  resources: { title: string; url: string; type: string }[];
  aiHints: { trigger: string; content: string }[];
  status: 'draft' | 'published' | 'archived';
  createdBy: mongoose.Types.ObjectId;
  metrics: {
    attempts: number;
    solutions: number;
    successRate: number;
  };
  estimatedTime?: number;
  dataAssumptions?: string[];
  edgeCases?: string[];
  subtasks?: string[];
  communityTips?: ICommunityTip[];
  aiPrompts?: string[];
  technicalParameters?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CrucibleProblemSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      enum: ['algorithms', 'system-design', 'web-development', 'mobile-development', 'data-science', 'devops', 'frontend', 'backend'],
      required: true,
      default: 'algorithms',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'expert'],
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    requirements: {
      functional: [{
        requirement: { type: String, required: true },
        context: { type: String, default: '' }
      }],
      nonFunctional: [{
        requirement: { type: String, required: true },
        context: { type: String, default: '' }
      }],
    },
    constraints: {
      type: [String],
      default: [],
    },
    expectedOutcome: {
      type: String,
      required: true,
    },
    hints: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    metrics: {
      attempts: {
        type: Number,
        default: 0,
      },
      solutions: {
        type: Number,
        default: 0,
      },
      successRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
    estimatedTime: {
      type: Number,
      default: 0,
    },
    learningObjectives: {
      type: [String],
      default: [],
    },
    prerequisites: [
      {
        name: { type: String, required: true },
        link: { type: String, default: '' },
      },
    ],
    userPersona: {
      name: { type: String, default: '' },
      journey: { type: String, default: '' },
    },
    resources: [
        {
            title: { type: String, required: true },
            url: { type: String, required: true },
            type: { type: String, required: true },
        }
    ],
    aiHints: [
        {
            trigger: { type: String, required: true },
            content: { type: String, required: true },
        }
    ],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
    },
    dataAssumptions: {
      type: [String],
      default: [],
    },
    edgeCases: {
      type: [String],
      default: [],
    },
    relatedResources: [
      {
        title: { type: String, required: true },
        link: { type: String, default: '' },
      },
    ],
    subtasks: {
      type: [String],
      default: [],
    },
    communityTips: [
      {
        content: { type: String, required: true },
        author: { type: String, default: 'Anonymous' },
      },
    ],
    aiPrompts: {
      type: [String],
      default: [],
    },
    technicalParameters: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Add indexes for better query performance
CrucibleProblemSchema.index({ difficulty: 1, tags: 1 });
CrucibleProblemSchema.index({ createdBy: 1 });
CrucibleProblemSchema.index({ createdAt: -1 });
CrucibleProblemSchema.index({ title: 1 });
CrucibleProblemSchema.index({ category: 1 });
CrucibleProblemSchema.index({ status: 1 });

export default mongoose.model<ICrucibleProblem>('CrucibleProblem', CrucibleProblemSchema); 