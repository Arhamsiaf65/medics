import mongoose, { Document, Types } from 'mongoose';
export interface IAppointment extends Document {
    patient?: Types.ObjectId;
    doctor?: Types.ObjectId;
    date: Date;
    timeSlot: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
    paymentStatus: 'pending' | 'paid';
    approvedBy?: Types.ObjectId;
    cancellationReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Appointment: mongoose.Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=appointment.model.d.ts.map