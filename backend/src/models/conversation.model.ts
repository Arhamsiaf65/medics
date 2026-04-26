import mongoose, { Schema, Document } from "mongoose";

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  type: 'general' | 'appointment';
  appointmentId?: mongoose.Types.ObjectId;
  status: 'active' | 'archived' | 'closed';
  lastMessageAt: Date;
}

const ConversationSchema = new Schema({
  participants: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }],
  type: { 
    type: String, 
    enum: ['general', 'appointment'], 
    default: 'general' 
  },
  appointmentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Appointment',
    required: false
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'closed'],
    default: 'active'
  },
  lastMessageAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

ConversationSchema.index({ participants: 1, type: 1 });
ConversationSchema.index({ appointmentId: 1 });

export const Conversation = mongoose.model<IConversation>("Conversation", ConversationSchema);
