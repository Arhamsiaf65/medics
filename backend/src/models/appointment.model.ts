import mongoose, { Document, Schema, Types } from 'mongoose';

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

const appointmentSchema = new Schema<IAppointment>(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User' },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor' },
    date: {
      type: Date,
      required: true
    },
    timeSlot: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
      default: 'pending'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending'
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    cancellationReason: {
      type: String
    }
  },
  { timestamps: true }
);

export const Appointment = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', appointmentSchema);
