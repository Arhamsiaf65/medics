import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name?: string;
  email?: string;
  password?: string;
  medicalHistory?: string;
  emergencyContact?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    medicalHistory: { type: String, default: '' },
    emergencyContact: { type: String, default: '' },
    isVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default User;
