import mongoose, { Document } from 'mongoose';
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
declare const User: mongoose.Model<any, {}, {}, {}, any, any, any>;
export default User;
//# sourceMappingURL=user.model.d.ts.map