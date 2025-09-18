import mongoose, { Schema, Document, Connection } from 'mongoose';
import { getAcademyConnection } from '../../config/academyDatabase';

export type LessonType = 'video' | 'workshop' | 'project' | 'reading' | 'quiz' | 'assignment';

export type ResourceType = 'youtube' | 'pdf' | 'notion' | 'link' | 'meet';

export interface ILessonContentResource {
  title?: string;
  url?: string;
  type?: ResourceType;
}

export interface ILesson extends Document {
  weekId: mongoose.Types.ObjectId;
  dayNumber: number;
  title: string;
  description?: string;
  type: LessonType;
  content?: {
    duration?: number;
    videoUrl?: string;
    readingUrl?: string;
    instructions?: string;
    resources?: ILessonContentResource[];
  };
  points: number;
  isActive: boolean;
  prerequisites: mongoose.Types.ObjectId[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<ILessonContentResource>({
  title: { type: String },
  url: { type: String },
  type: { type: String, enum: ['youtube', 'pdf', 'notion', 'link', 'meet'] }
}, { _id: false });

const LessonSchema = new Schema<ILesson>(
  {
    weekId: { type: Schema.Types.ObjectId, ref: 'Week', required: true, index: true },
    dayNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['video', 'workshop', 'project', 'reading', 'quiz', 'assignment'], required: true },
    content: {
      duration: { type: Number },
      videoUrl: { type: String },
      readingUrl: { type: String },
      instructions: { type: String },
      resources: { type: [ResourceSchema], default: [] }
    },
    points: { type: Number, default: 10 },
    isActive: { type: Boolean, default: true, index: true },
    prerequisites: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
    order: { type: Number, required: true, index: true }
  },
  { timestamps: true }
);

LessonSchema.index({ weekId: 1, isActive: 1, order: 1 });
LessonSchema.index({ weekId: 1, order: 1 }, { unique: true });
LessonSchema.index({ isActive: 1, order: 1 });

export const getLessonModel = (): mongoose.Model<ILesson> => {
  const connection: Connection = getAcademyConnection();
  return connection.models.Lesson || connection.model<ILesson>('Lesson', LessonSchema);
};



