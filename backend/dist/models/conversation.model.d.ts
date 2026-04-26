import mongoose, { Document } from "mongoose";
export interface IConversation extends Document {
    participants: mongoose.Types.ObjectId[];
    type: 'general' | 'appointment';
    appointmentId?: mongoose.Types.ObjectId;
    status: 'active' | 'archived' | 'closed';
    lastMessageAt: Date;
}
export declare const Conversation: mongoose.Model<IConversation, {}, {}, {}, mongoose.Document<unknown, {}, IConversation, {}, mongoose.DefaultSchemaOptions> & IConversation & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IConversation>;
//# sourceMappingURL=conversation.model.d.ts.map