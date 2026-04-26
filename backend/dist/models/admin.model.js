import mongoose, { Document, Schema, Types } from 'mongoose';
const adminSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    permissions: [{ type: String }],
    isRoot: { type: Boolean, default: false }
}, { timestamps: true });
export const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
//# sourceMappingURL=admin.model.js.map