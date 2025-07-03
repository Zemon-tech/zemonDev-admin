import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';

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
      user.role = req.body.role || user.role;

      const updatedUser = await user.save();
      res.json(updatedUser);
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