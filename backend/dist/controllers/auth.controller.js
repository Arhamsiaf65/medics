import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { Admin } from '../models/admin.model.js';
import { Doctor } from '../models/doctor.model.js';
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '7d',
    });
};
const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
};
const setTokensInCookies = (res, token, refreshToken) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // 'strict' blocks cookies in cross-origin requests (e.g. localhost → Railway)
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // 'strict' blocks cookies in cross-origin requests (e.g. localhost → Railway)
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
};
const determineUserRole = async (userId) => {
    const admin = await Admin.findOne({ user: userId });
    if (admin)
        return 'Admin';
    const doctor = await Doctor.findOne({ user: userId });
    if (doctor)
        return 'Doctor';
    return 'Patient';
};
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });
        if (user) {
            const token = generateToken(user._id);
            const refreshToken = generateRefreshToken(user._id);
            setTokensInCookies(res, token, refreshToken);
            // New registrations via this portal are always Patients
            res.status(201).json({
                user: { _id: user._id, name: user.name, email: user.email, role: 'Patient' },
                token, // Return token directly to bypass cookie issues
            });
        }
        else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && user.password && (await bcrypt.compare(password, user.password))) {
            const token = generateToken(user._id);
            const refreshToken = generateRefreshToken(user._id);
            setTokensInCookies(res, token, refreshToken);
            const role = await determineUserRole(user._id);
            res.json({
                user: { _id: user._id, name: user.name, email: user.email, role },
                token, // Return token directly to bypass cookie issues
            });
        }
        else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
export const logout = async (req, res) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    };
    res.clearCookie('token', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
    res.status(200).json({ message: 'Logged out successfully' });
};
export const getMe = async (req, res) => {
    const user = req.user;
    if (!user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    const role = await determineUserRole(user._id);
    res.status(200).json({ user: { _id: user._id, name: user.name, email: user.email, role } });
};
export const refreshTokenHandler = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        console.log('Refresh token attempt, cookie present:', !!refreshToken);
        if (!refreshToken) {
            console.log('No refresh token in cookies');
            res.status(401).json({ message: 'Refresh token is required' });
            return;
        }
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        jwt.verify(refreshToken, secret, (err, decoded) => {
            if (err) {
                console.log('Refresh token verification failed:', err.message);
                res.status(403).json({ message: 'Invalid or expired refresh token' });
                return;
            }
            console.log('Refresh token verified for user:', decoded.id);
            const newToken = generateToken(decoded.id);
            res.cookie('token', newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            res.json({ message: 'Token refreshed successfully' });
        });
    }
    catch (error) {
        console.error('Refresh token handler error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
//# sourceMappingURL=auth.controller.js.map