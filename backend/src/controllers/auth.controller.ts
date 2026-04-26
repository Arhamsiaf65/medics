import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { Admin } from '../models/admin.model.js';
import { Doctor } from '../models/doctor.model.js';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d',
  });
};

const generateRefreshToken = (id: string) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret', {
    expiresIn: '30d',
  });
};

const setTokensInCookies = (res: Response, token: string, refreshToken: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
};

const determineUserRole = async (userId: string): Promise<string> => {
  const admin = await Admin.findOne({ user: userId });
  if (admin) return 'Admin';
  
  const doctor = await Doctor.findOne({ user: userId });
  if (doctor) return 'Doctor';
  
  return 'Patient';
};

export const register = async (req: Request, res: Response): Promise<void> => {
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
      const token = generateToken(user._id as string);
      const refreshToken = generateRefreshToken(user._id as string);
      setTokensInCookies(res, token, refreshToken);

      // New registrations via this portal are always Patients
      res.status(201).json({
        user: { _id: user._id, name: user.name, email: user.email, role: 'Patient' },
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user._id as string);
      const refreshToken = generateRefreshToken(user._id as string);
      setTokensInCookies(res, token, refreshToken);

      const role = await determineUserRole(user._id as string);

      res.json({
        user: { _id: user._id, name: user.name, email: user.email, role },
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully' });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }
  
  const role = await determineUserRole(user._id as string);
  res.status(200).json({ user: { _id: user._id, name: user.name, email: user.email, role } });
};

export const refreshTokenHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ message: 'Refresh token is required' });
      return;
    }

    const secret = process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret';
    jwt.verify(refreshToken, secret, (err: any, decoded: any) => {
      if (err) {
        res.status(403).json({ message: 'Invalid or expired refresh token' });
        return;
      }

      const newToken = generateToken(decoded.id);
      res.cookie('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({ message: 'Token refreshed successfully' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
