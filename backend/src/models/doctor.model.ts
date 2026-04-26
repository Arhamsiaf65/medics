import mongoose, { Document, Schema, Types } from 'mongoose';

/**
 * Broad availability window (e.g. "09:00" to "13:00").
 * The system auto-generates individual bookable slots from these using slotDuration.
 */
interface TimeBlock {
  start: string; // "09:00"
  end: string;   // "13:00"
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

const doctorSchema = new Schema<IDoctor>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    specialization: String,
    experience: Number,
    fee: Number,
    slotDuration: {
      type: Number,
      default: 30
    },
    workingHours: {
      monday: [{ start: String, end: String }],
      tuesday: [{ start: String, end: String }],
      wednesday: [{ start: String, end: String }],
      thursday: [{ start: String, end: String }],
      friday: [{ start: String, end: String }],
      saturday: [{ start: String, end: String }],
      sunday: [{ start: String, end: String }]
    },
    timezone: {
      type: String,
      default: "Asia/Karachi"
    }
  },
  { timestamps: true }
);

export const Doctor = mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', doctorSchema);
