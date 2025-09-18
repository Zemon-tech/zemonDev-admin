import mongoose, { Schema, Document, Connection } from 'mongoose';
import { getAcademyConnection } from '../../config/academyDatabase';

export interface IWeek extends Document {
  phaseId: mongoose.Types.ObjectId;
  weekNumber: number;
  title: string;
  description?: string;
  isActive: boolean;
  estimatedDuration?: number;
  objectives: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WeekSchema = new Schema<IWeek>(
  {
    phaseId: { type: Schema.Types.ObjectId, ref: 'Phase', required: true, index: true },
    weekNumber: { type: Number, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    estimatedDuration: { type: Number },
    objectives: [{ type: String }]
  },
  { timestamps: true }
);

WeekSchema.index({ phaseId: 1, isActive: 1, weekNumber: 1 });
WeekSchema.index({ isActive: 1, weekNumber: 1 });

export const getWeekModel = (): mongoose.Model<IWeek> => {
  const connection: Connection = getAcademyConnection();
  return connection.models.Week || connection.model<IWeek>('Week', WeekSchema);
};



