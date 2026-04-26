import { Conversation } from '../models/conversation.model.js';
import { Message } from '../models/message.model.js';
import mongoose from 'mongoose';
/**
 * GET /api/chat/:user1/:user2
 * Fetches the general conversation (and history) between two users.
 */
export const getChatHistory = async (req, res) => {
    try {
        const user1 = req.params.user1;
        const user2 = req.params.user2;
        if (!user1 || !user2 || !mongoose.Types.ObjectId.isValid(user1) || !mongoose.Types.ObjectId.isValid(user2)) {
            res.status(400).json({ message: 'Valid user IDs are required' });
            return;
        }
        // Find existing general conversation between these two
        const conversation = await Conversation.findOne({
            participants: { $all: [user1, user2] },
            type: 'general'
        });
        if (!conversation) {
            // No interaction yet, return empty list
            res.json([]);
            return;
        }
        // Fetch messages for this conversation, sorted by oldest first to display easily
        const messages = await Message.find({ conversationId: conversation._id })
            .sort({ createdAt: 1 })
            .limit(100);
        // Format to match what the frontend expects
        const formatted = messages.map(msg => ({
            senderId: msg.senderId.toString(),
            message: msg.content,
            createdAt: msg.createdAt
        }));
        res.json(formatted);
    }
    catch (error) {
        console.error("Fetch Chat Error:", error);
        res.status(500).json({ message: 'Server Error fetching messages' });
    }
};
//# sourceMappingURL=chat.controller.js.map