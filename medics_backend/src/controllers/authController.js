const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { generateToken } = require('../utils/jwt');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;


        console.log("here for registration");
        
        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Name, email, and password are required.',
                code: 'MISSING_FIELDS',
            });
        }

        // Check if user already exists
        console.log("email to check:", email);
        const existingUser = await prisma.user.findUnique({
            where: { email: email },
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User with this email already exists.',
                code: 'USER_EXISTS',
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatarUrl: true,
                createdAt: true,
            },
        });

        // Generate token and create session
        const { token, expiresAt } = generateToken(user.id);
        const deviceInfo = req.headers['user-agent'] || 'Unknown Device';

        await prisma.session.create({
            data: {
                userId: user.id,
                token,
                deviceInfo,
                expiresAt,
            },
        });

        res.status(201).json({
            success: true,
            data: {
                user,
                token,
                expiresAt,
            },
            message: 'User registered successfully.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        console.log("Login attempt for email:", email);
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required.',
                code: 'MISSING_FIELDS',
            });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password.',
                code: 'INVALID_CREDENTIALS',
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password.',
                code: 'INVALID_CREDENTIALS',
            });
        }

        // Generate token and create session
        const { token, expiresAt } = generateToken(user.id);
        const deviceInfo = req.headers['user-agent'] || 'Unknown Device';

        await prisma.session.create({
            data: {
                userId: user.id,
                token,
                deviceInfo,
                expiresAt,
            },
        });

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            data: {
                user: userWithoutPassword,
                token,
                expiresAt,
            },
            message: 'Login successful.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
    try {
        // Delete the current session
        await prisma.session.delete({
            where: { id: req.session.id },
        });

        res.json({
            success: true,
            data: null,
            message: 'Logged out successfully.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatarUrl: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        res.json({
            success: true,
            data: user,
            message: 'User profile retrieved.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
    try {
        const { name, phone, avatarUrl } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatarUrl: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        res.json({
            success: true,
            data: user,
            message: 'Profile updated successfully.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all active sessions for user
 * GET /api/auth/sessions
 */
const getSessions = async (req, res, next) => {
    try {
        const sessions = await prisma.session.findMany({
            where: {
                userId: req.user.id,
                expiresAt: { gt: new Date() },
            },
            select: {
                id: true,
                deviceInfo: true,
                createdAt: true,
                expiresAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Mark current session
        const sessionsWithCurrent = sessions.map((session) => ({
            ...session,
            isCurrent: session.id === req.session.id,
        }));

        res.json({
            success: true,
            data: sessionsWithCurrent,
            message: 'Sessions retrieved successfully.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a specific session
 * DELETE /api/auth/sessions/:id
 */
const deleteSession = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Find the session and verify ownership
        const session = await prisma.session.findUnique({
            where: { id },
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found.',
                code: 'SESSION_NOT_FOUND',
            });
        }

        if (session.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'You can only delete your own sessions.',
                code: 'FORBIDDEN',
            });
        }

        await prisma.session.delete({
            where: { id },
        });

        res.json({
            success: true,
            data: null,
            message: 'Session terminated successfully.',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    logout,
    getMe,
    updateProfile,
    getSessions,
    deleteSession,
};
