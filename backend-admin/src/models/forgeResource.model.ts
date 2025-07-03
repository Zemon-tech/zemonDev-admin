import mongoose, { Schema, Document } from 'mongoose';

interface Review {
  userId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IForgeResource extends Document {
  title: string;
  type: 'article' | 'video' | 'book' | 'course' | 'tool' | 'repository' | 'documentation';
  url: string;
  description: string;
  content?: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdBy: mongoose.Types.ObjectId;
  reviews: Review[];
  metrics: {
    views: number;
    bookmarks: number;
    rating: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ForgeResourceSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['article', 'video', 'book', 'course', 'tool', 'repository', 'documentation'],
      required: [true, 'Please specify the resource type'],
    },
    url: {
      type: String,
      required: [true, 'Please provide a URL'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
    },
    content: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
        comment: {
          type: String,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    metrics: {
      views: {
        type: Number,
        default: 0,
      },
      bookmarks: {
        type: Number,
        default: 0,
      },
      rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IForgeResource>('ForgeResource', ForgeResourceSchema); 