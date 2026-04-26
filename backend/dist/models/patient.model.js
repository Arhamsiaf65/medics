import mongoose, { Document, Schema, Types } from 'mongoose';
const patientSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    medicalHistory: { type: String, default: '' },
    emergencyContact: { type: String, default: '' }
}, { timestamps: true });
export const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);
//# sourceMappingURL=patient.model.js.map