import mongoose, { Document, Types } from 'mongoose';
/**
 * Broad availability window (e.g. "09:00" to "13:00").
 * The system auto-generates individual bookable slots from these using slotDuration.
 */
interface TimeBlock {
    start: string;
    end: string;
}
export interface IDoctor extends Document {
    user?: Types.ObjectId;
    specialization?: string;
    experience?: number;
    fee?: number;
    /** Duration of each bookable slot in minutes (e.g. 30 = 30-minute slots) */
    slotDuration: number;
    /** Broad availability windows per day. Individual slots are generated from these + slotDuration. */
    workingHours?: {
        monday: TimeBlock[];
        tuesday: TimeBlock[];
        wednesday: TimeBlock[];
        thursday: TimeBlock[];
        friday: TimeBlock[];
        saturday: TimeBlock[];
        sunday: TimeBlock[];
    };
    timezone: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Doctor: mongoose.Model<any, {}, {}, {}, any, any, any>;
export {};
//# sourceMappingURL=doctor.model.d.ts.map