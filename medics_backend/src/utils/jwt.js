const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a JWT token for a user
 * @param {string} userId - The user's ID
 * @returns {object} - Token and expiry date
 */
const generateToken = (userId) => {
    const expiresIn = JWT_EXPIRES_IN;
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn });

    // Calculate expiry date
    const expiresAt = new Date();
    const days = parseInt(expiresIn) || 7;
    expiresAt.setDate(expiresAt.getDate() + days);

    return { token, expiresAt };
};

/**
 * Verify and decode a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {object|null} - Decoded payload or null if invalid
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - The Authorization header value
 * @returns {string|null} - The token or null
 */
const extractToken = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
};

module.exports = {
    generateToken,
    verifyToken,
    extractToken,
    JWT_SECRET,
    JWT_EXPIRES_IN,
};
