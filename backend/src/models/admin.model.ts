import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAdmin extends Document {
  user: Types.ObjectId;
  permissions?: string[];
  isRoot: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    permissions: [{ type: String }],
    isRoot: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Admin = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', adminSchema);
