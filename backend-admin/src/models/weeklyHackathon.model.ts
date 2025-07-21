import mongoose, { Schema, Document } from 'mongoose';

export interface IWeeklyHackathon extends Document {
  title: string;
  description: string;
  problems: mongoose.Types.ObjectId[];
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WeeklyHackathonSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    problems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CrucibleProblem',
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Add index for efficient querying by date
WeeklyHackathonSchema.index({ startDate: -1, endDate: -1 });

export default mongoose.model<IWeeklyHackathon>('WeeklyHackathon', WeeklyHackathonSchema); 