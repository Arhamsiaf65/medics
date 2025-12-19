const prisma = require('../config/database');
const { verifyToken, extractToken } = require('../utils/jwt');

/**
 * Authentication middleware
 * Validates JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
    try {
        const token = extractToken(req.headers.authorization);

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.',
                code: 'NO_TOKEN',
            });
        }

        // Verify the token
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token.',
                code: 'INVALID_TOKEN',
            });
        }

        // Check if session exists in database
        const session = await prisma.session.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!session) {
            return res.status(401).json({
                success: false,
                error: 'Session not found. Please login again.',
                code: 'SESSION_NOT_FOUND',
            });
        }

        // Check if session is expired
        if (new Date() > session.expiresAt) {
            // Delete expired session
            await prisma.session.delete({ where: { id: session.id } });
            return res.status(401).json({
                success: false,
                error: 'Session expired. Please login again.',
                code: 'SESSION_EXPIRED',
            });
        }

        // Attach user and session to request
        req.user = session.user;
        req.session = session;
        req.token = token;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication failed.',
            code: 'AUTH_ERROR',
        });
    }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
    try {
        const token = extractToken(req.headers.authorization);

        if (token) {
            const decoded = verifyToken(token);
            if (decoded) {
                const session = await prisma.session.findUnique({
                    where: { token },
                    include: { user: true },
                });

                if (session && new Date() <= session.expiresAt) {
                    req.user = session.user;
                    req.session = session;
                    req.token = token;
                }
            }
        }

        next();
    } catch (error) {
        next();
    }
};

/**
 * Authorization middleware
 * Check if user has required role
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated.',
                code: 'UNAUTHORIZED',
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Insufficient permissions.',
                code: 'FORBIDDEN',
            });
        }
        next();
    };
};

module.exports = {
    authenticate,
    optionalAuth,
    authorize,
};
