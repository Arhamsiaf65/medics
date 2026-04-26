import mongoose, { Schema, Document } from "mongoose";
const MessageSchema = new Schema({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    readBy: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
}, { timestamps: true });
MessageSchema.index({ conversationId: 1, createdAt: -1 });
export const Message = mongoose.model("Message", MessageSchema);
//# sourceMappingURL=message.model.js.map