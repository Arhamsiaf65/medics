import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
export const protect = async (req, res, next) => {
    let token = req.cookies?.token;
    if (token) {
        try {
            const secret = process.env.JWT_SECRET || 'fallback_secret';
            const decoded = jwt.verify(token, secret);
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                res.status(401).json({ message: 'Not authorized, user not found' });
                return;
            }
            req.user = user;
            next();
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                res.status(401).json({ message: 'Token expired' });
                return;
            }
            res.status(401).json({ message: 'Invalid token' });
            return;
        }
    }
    else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
//# sourceMappingURL=auth.middleware.js.map