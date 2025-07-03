import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user.model';

// Extend the Express Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const jwtSecret = process.env.JWT_SECRET;
      
      if (!jwtSecret) {
        throw new Error('JWT_SECRET not found in environment variables');
      }

      const decoded = jwt.verify(token, jwtSecret) as { id: string };
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
    return;
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const admin = (req: Request, res: Response, next: NextFunction): void => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Not authorized as an admin' });
    }
  }; 