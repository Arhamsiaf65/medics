import mongoose, { Document, Schema } from 'mongoose';
const userSchema = new Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    medicalHistory: { type: String, default: '' },
    emergencyContact: { type: String, default: '' },
    isVerified: { type: Boolean, default: false }
}, { timestamps: true });
const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
//# sourceMappingURL=user.model.js.map