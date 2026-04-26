import mongoose, { Document } from "mongoose";
export interface IMessage extends Document {
    conversationId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    content: string;
    readBy: mongoose.Types.ObjectId[];
    createdAt: Date;
}
export declare const Message: mongoose.Model<IMessage, {}, {}, {}, mongoose.Document<unknown, {}, IMessage, {}, mongoose.DefaultSchemaOptions> & IMessage & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IMessage>;
//# sourceMappingURL=message.model.d.ts.map