const prisma = require('../config/database');
const { getIo } = require('../config/socket');

/**
 * Get chat messages for a specific doctor
 * GET /api/chat/:doctorId
 */
const getMessages = async (req, res, next) => {
    try {
        const { doctorId } = req.params;
        const userId = req.user.id;

        // Ensure we are fetching for the correct user context
        // If the requester is a doctor, we might simply swap logic or rely on them passing the userId of the patient?
        // But the route is /:doctorId.
        // If a Doctor calls this, they are likely passing the USER ID they want to chat with.
        // Let's check the role.

        let targetUserId = userId; // Default: User fetching own messages with doctor
        let targetDoctorId = doctorId;

        if (req.user.role === 'DOCTOR') {
            // If logged in as doctor, the "doctorId" param in the URL is actually the PATIENT (USER) ID they are viewing
            // OR we should change the route to be /:otherId
            // For now, let's assume if role is DOCTOR, the param `doctorId` is actually `userId` (patientId)
            targetUserId = doctorId; // The ID passed in param
            // We need the doctor's own ID.
            const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
            if (!doctor) throw new Error('Doctor profile not found');
            targetDoctorId = doctor.id;
        }

        const messages = await prisma.chatMessage.findMany({
            where: {
                userId: targetUserId,
                doctorId: targetDoctorId
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json({
            success: true,
            data: messages,
            message: 'Messages retrieved successfully.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Send a message to a doctor (or user)
 * POST /api/chat/:doctorId
 */
const sendMessage = async (req, res, next) => {
    try {
        const { doctorId } = req.params;
        const { text } = req.body;
        const requesterId = req.user.id;
        const requesterRole = req.user.role;

        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'Message text is required.'
            });
        }

        let targetUserId;
        let targetDoctorId;
        let isFromUser = true;

        if (requesterRole === 'DOCTOR') {
            // Sending to USER
            // "doctorId" param is treated as target UserId
            targetUserId = doctorId;
            const doctor = await prisma.doctor.findUnique({ where: { userId: requesterId } });
            if (!doctor) throw new Error('Doctor profile not found');
            targetDoctorId = doctor.id;
            isFromUser = false;
        } else {
            // User sending to Doctor
            targetUserId = requesterId;
            targetDoctorId = doctorId;
            isFromUser = true;
        }

        // Save message
        const message = await prisma.chatMessage.create({
            data: {
                userId: targetUserId,
                doctorId: targetDoctorId,
                text,
                isFromUser
            }
        });

        // Emit socket event to BOTH parties' rooms (User ID and Doctor User ID)
        // We find the doctor's USER ID to emit to their room
        // The user's room is their userId.

        const io = getIo();

        // Emit to User room
        io.to(targetUserId).emit('new_message', message);

        // Find doctor's userId to emit to them
        const doctorData = await prisma.doctor.findUnique({ where: { id: targetDoctorId } });
        if (doctorData && doctorData.userId) {
            io.to(doctorData.userId).emit('new_message', message);
        }

        res.status(201).json({
            success: true,
            data: message,
            message: 'Message sent successfully.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get list of conversations for the logged-in doctor
 * GET /api/chat/conversations
 */
const getDoctorConversations = async (req, res, next) => {
    try {
        if (req.user.role !== 'DOCTOR') {
            return res.status(403).json({ success: false, message: 'Access denied. Doctors only.' });
        }

        const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
        }

        // Find distinct userIds from messages involving this doctor
        const distinctUsers = await prisma.chatMessage.findMany({
            where: { doctorId: doctor.id },
            distinct: ['userId'],
            select: { userId: true }
        });

        const userIds = distinctUsers.map(u => u.userId);

        // Fetch user details
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true, avatarUrl: true }
        });

        res.json({
            success: true,
            data: users,
            message: 'Conversations retrieved.'
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get list of conversations for the logged-in user (User Role)
 * GET /api/chat/user/conversations
 */
const getUserConversations = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Find distinct doctorIds from messages involving this user
        const distinctDoctors = await prisma.chatMessage.findMany({
            where: { userId: userId },
            distinct: ['doctorId'],
            select: { doctorId: true }
        });

        const doctorIds = distinctDoctors.map(d => d.doctorId);

        // Fetch doctor details
        const doctors = await prisma.doctor.findMany({
            where: { id: { in: doctorIds } },
            include: { user: { select: { name: true, avatarUrl: true } } } // Include user base info or just use doctor fields? Doctor has name/imageUrl.
        });

        // Map to simpler format if needed, but returning doctor objects is fine
        res.json({
            success: true,
            data: doctors,
            message: 'User conversations retrieved.'
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMessages,
    sendMessage,
    getDoctorConversations,
    getUserConversations
};
