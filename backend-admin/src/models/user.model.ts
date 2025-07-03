import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password?: string;
  fullName: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Do not return password by default
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
  next();
});

UserSchema.methods.comparePassword = async function (password: string) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};


export default mongoose.model<IUser>('User', UserSchema); 