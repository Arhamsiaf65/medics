import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token = req.cookies?.token;

  if (token) {
    try {
      const secret = process.env.JWT_SECRET as string || 'fallback_secret';
      const decoded = jwt.verify(token, secret) as any;

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
         res.status(401).json({ message: 'Not authorized, user not found' });
         return;
      }
      
      req.user = user;
      next();
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({ message: 'Token expired' });
        return;
      }
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
