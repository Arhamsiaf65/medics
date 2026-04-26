import mongoose, { Document, Types } from 'mongoose';
export interface IAdmin extends Document {
    user: Types.ObjectId;
    permissions?: string[];
    isRoot: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Admin: mongoose.Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=admin.model.d.ts.map