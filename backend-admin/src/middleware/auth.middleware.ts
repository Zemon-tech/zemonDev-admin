import { Request, Response, NextFunction } from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import User from '../models/user.model';
import { UserRole } from '../models';

// Extend the Express Request interface to include user and auth
declare global {
  namespace Express {
    interface Request {
      user?: any;
      auth?: {
        userId: string;
        sessionId: string;
        getToken: () => Promise<string>;
      };
      userRole?: any; // Add userRole property
    }
  }
}

/**
 * Middleware to protect routes using Clerk authentication.
 */
export const protect = [
  (req: Request, res: Response, next: NextFunction) => {
    next();
  },
  ClerkExpressRequireAuth({
    onError: (err: Error) => {
      console.error('[CLERK AUTH ERROR]', err);
    }
  }),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth || !req.auth.userId) {
      return next(new AppError('User authentication data not found after validation.', 500));
    }

    try {
      const user = await User.findOne({ clerkId: req.auth.userId });
      if (!user) {
        return next(new AppError('User not found in application database.', 404));
      }
      req.user = user;
      next();
    } catch (error) {
      console.error('Error fetching user data from database:', error);
      next(new AppError('An error occurred while authenticating the user.', 500));
    }
  })
];

/**
 * Middleware to check if user has required role
 * @param roles Array of roles that are allowed to access the route
 */
export const checkRole = (roles: ('admin' | 'moderator')[]) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user._id) {
      return next(new AppError('Unauthorized', 401));
    }

    const userId = req.user._id;

    const query: any = {
      userId,
      role: { $in: roles }
    };

    const userRole = await UserRole.findOne(query);

    if (!userRole) {
      return next(new AppError(`Access denied. Required role: ${roles.join(' or ')}`, 403));
    }

    req.userRole = userRole;
    next();
  });
}; 