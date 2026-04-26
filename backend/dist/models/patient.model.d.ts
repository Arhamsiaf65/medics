import mongoose, { Document, Types } from 'mongoose';
export interface IPatient extends Document {
    user: Types.ObjectId;
    medicalHistory?: string;
    emergencyContact?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Patient: mongoose.Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=patient.model.d.ts.map