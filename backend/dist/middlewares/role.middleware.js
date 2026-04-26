import { Doctor } from '../models/doctor.model.js';
import { Admin } from '../models/admin.model.js';
export const isDoctor = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({ message: 'Not authorized, no user found' });
            return;
        }
        const doctor = await Doctor.findOne({ user: req.user.id });
        if (doctor) {
            next();
        }
        else {
            res.status(403).json({ message: 'Access denied: Route restricted to doctors only' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error in role verification' });
    }
};
export const isAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({ message: 'Not authorized, no user found' });
            return;
        }
        const admin = await Admin.findOne({ user: req.user.id });
        if (admin) {
            next();
        }
        else {
            res.status(403).json({ message: 'Access denied: Route restricted to admin only' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error in role verification' });
    }
};
export const isRootAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({ message: 'Not authorized, no user found' });
            return;
        }
        const admin = await Admin.findOne({ user: req.user.id });
        if (admin && admin.isRoot) {
            next();
        }
        else {
            res.status(403).json({ message: 'Access denied: Route restricted to root admin only' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error in root role verification' });
    }
};
//# sourceMappingURL=role.middleware.js.map