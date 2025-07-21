import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import UserRole from '../models/userRole.model';
import mongoose from 'mongoose';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.email = req.body.email || user.email;

      // Ensure the user making the request is authenticated
      if (!req.auth || !req.auth.userId) {
          res.status(401).json({ message: 'Not authorized' });
          return;
      }

      if (req.body.role) {
        const userRole = await UserRole.findOne({ userId: user._id });
        if (userRole) {
          userRole.role = req.body.role;
          await userRole.save();
        } else {
            // If no role exists, create one.
            // NOTE: This assumes the updater is an admin. The 'grantedBy' should ideally be the current admin user's ID.
            // For now, we'll use the user's own ID as a placeholder.
            await UserRole.create({
                userId: user._id,
                role: req.body.role,
                grantedBy: new mongoose.Types.ObjectId(req.auth.userId), 
            });
        }
      }

      const updatedUser = await user.save();
      const updatedUserRole = await UserRole.findOne({ userId: updatedUser._id });

      res.json({
        ...updatedUser.toObject(),
        role: updatedUserRole ? updatedUserRole.role : 'user',
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
}; 