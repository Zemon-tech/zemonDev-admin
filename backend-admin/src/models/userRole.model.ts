import mongoose, { Schema, Document } from 'mongoose';

export interface IUserRole extends Document {
  userId: mongoose.Types.ObjectId;
  role: 'user' | 'moderator' | 'admin';
  channelId?: mongoose.Types.ObjectId;
  grantedBy: mongoose.Types.ObjectId;
  grantedAt: Date;
}

const UserRoleSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user',
      required: true,
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ArenaChannel',
    },
    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    grantedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Add indexes for better query performance
UserRoleSchema.index({ userId: 1, role: 1 });
UserRoleSchema.index({ channelId: 1, role: 1 }); // For finding all moderators/admins of a channel

export default mongoose.model<IUserRole>('UserRole', UserRoleSchema); 