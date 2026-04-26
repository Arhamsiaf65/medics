import mongoose, { Document, Schema, Types } from 'mongoose';
const doctorSchema = new Schema({
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
}, { timestamps: true });
export const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);
//# sourceMappingURL=doctor.model.js.map