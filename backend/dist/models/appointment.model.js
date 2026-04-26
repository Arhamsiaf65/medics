import mongoose, { Document, Schema, Types } from 'mongoose';
const appointmentSchema = new Schema({
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
}, { timestamps: true });
export const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
//# sourceMappingURL=appointment.model.js.map