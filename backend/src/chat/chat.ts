import { getIO } from "../config/connectSocket.js";
import type { Server } from "socket.io";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";

const getChatRoomId = (doctorId: string, patientId: string) => {
    return [doctorId, patientId].sort().join("_");
};

export const initializeChatSocket = () => {
    const io: Server = getIO();

    io.on("connection", (socket) => {
        const userId = socket.handshake.auth.userId || socket.handshake.query.userId as string;

        if (!userId) return;

        socket.join(userId);

        console.log("User connected:", userId);


        socket.on("join:chat", ({ doctorId, patientId }) => {
            const roomId = getChatRoomId(doctorId, patientId);
            socket.join(roomId);

            console.log(`User ${userId} joined room ${roomId}`);
        });

        socket.on("chat:message", async (data) => {
            const { doctorId, patientId, senderId, message } = data;

            try {
                let conversation = await Conversation.findOne({
                    participants: { $all: [doctorId, patientId] },
                    type: 'general'
                });

                if (!conversation) {
                    conversation = await Conversation.create({
                        participants: [doctorId, patientId],
                        type: 'general'
                    });
                }

                const newMessage = await Message.create({
                    conversationId: conversation._id,
                    senderId,
                    content: message
                });

                conversation.lastMessageAt = newMessage.createdAt;
                await conversation.save();

                const roomId = getChatRoomId(doctorId, patientId);

                io.to(roomId).emit("chat:message", {
                    senderId: newMessage.senderId.toString(),
                    message: newMessage.content,
                    createdAt: newMessage.createdAt,
                });
            } catch (error) {
                console.error("Socket error saving message:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", userId);
        });
    });
};