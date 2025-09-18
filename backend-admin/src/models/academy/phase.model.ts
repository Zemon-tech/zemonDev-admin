import mongoose, { Schema, Document, Connection } from 'mongoose';
import { getAcademyConnection } from '../../config/academyDatabase';

export interface IPhase extends Document {
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  estimatedDuration?: number;
  prerequisites: mongoose.Types.ObjectId[];
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const PhaseSchema = new Schema<IPhase>(
  {
    name: { type: String, required: true },
    description: { type: String },
    order: { type: Number, required: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    estimatedDuration: { type: Number },
    prerequisites: [{ type: Schema.Types.ObjectId, ref: 'Phase' }],
    color: { type: String, default: '#3B82F6' }
  },
  { timestamps: true }
);

PhaseSchema.index({ isActive: 1, order: 1 });
PhaseSchema.index({ order: 1 });

export const getPhaseModel = (): mongoose.Model<IPhase> => {
  const connection: Connection = getAcademyConnection();
  return connection.models.Phase || connection.model<IPhase>('Phase', PhaseSchema);
};



