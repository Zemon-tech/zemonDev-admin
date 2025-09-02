import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import UserRole from '../models/userRole.model';
import mongoose from 'mongoose';
import {
  getUserSkillSummary,
  getDashboardSummary,
  getUserInsights,
  getNextUpRecommendation,
  rebuildDailyStatsFromHistory,
  recomputeLearningPatterns,
  recomputeRoleMatch,
} from '../services/userScoring.service';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role } = req.query;
    if (role) {
      // Find all userIds with the given role
      const userRoles = await UserRole.find({ role }).select('userId');
      const userIds = userRoles.map((ur) => ur.userId);
      const users = await User.aggregate([
        { $match: { _id: { $in: userIds } } },
        {
          $lookup: {
            from: 'userroles',
            localField: '_id',
            foreignField: 'userId',
            as: 'roleInfo',
          },
        },
        {
          $unwind: {
            path: '$roleInfo',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            role: { $ifNull: ['$roleInfo.role', 'user'] },
          },
        },
        {
          $project: {
            roleInfo: 0,
          },
        },
      ]);
      res.json(users);
      return;
    }
    // Default: return all users as before
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'userroles', // The collection name for UserRole model
          localField: '_id',
          foreignField: 'userId',
          as: 'roleInfo',
        },
      },
      {
        $unwind: {
          path: '$roleInfo',
          preserveNullAndEmptyArrays: true, // Keep users even if they don't have a role
        },
      },
      {
        $addFields: {
          role: { $ifNull: ['$roleInfo.role', 'user'] },
        },
      },
      {
        $project: {
          roleInfo: 0, // Exclude the roleInfo field from the final output
        },
      },
    ]);
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
                grantedBy: req.user._id, 
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

// @desc    Get current user (by Clerk session)
// @route   GET /api/users/me
// @access  Private/Admin
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
}; 

// New analytics endpoints

// @desc    Get scoring summary for current user
// @route   GET /api/users/me/scoring
// @access  Private/Admin
export const getUserScoringController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }
    const data = await getUserSkillSummary(new mongoose.Types.ObjectId(req.user._id));
    res.json({ success: true, message: 'User scoring data retrieved successfully', data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get compact dashboard summary
// @route   GET /api/users/me/dashboard
// @access  Private/Admin
export const getUserDashboardController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }
    const data = await getDashboardSummary(new mongoose.Types.ObjectId(req.user._id));
    res.json({ success: true, message: 'Dashboard summary fetched', data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get deep analytics insights
// @route   GET /api/users/me/insights
// @access  Private/Admin
export const getUserInsightsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }
    const data = await getUserInsights(new mongoose.Types.ObjectId(req.user._id));
    res.json({ success: true, message: 'User insights fetched', data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get next-up recommendation card
// @route   GET /api/users/me/next-up
// @access  Private/Admin
export const getNextUpController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }
    const data = await getNextUpRecommendation(new mongoose.Types.ObjectId(req.user._id));
    res.json({ success: true, message: 'Next-up recommendation fetched', data });
  } catch (error) {
    next(error);
  }
};

// @desc    Recompute analytics for current user
// @route   POST /api/users/me/recompute-analytics
// @access  Private/Admin
export const recomputeUserAnalyticsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const daily = await rebuildDailyStatsFromHistory(userId);
    const patterns = await recomputeLearningPatterns(userId);
    const role = await recomputeRoleMatch(userId);
    res.json({ success: true, message: 'Analytics recomputed', data: { dailyStats: daily, learningPatterns: patterns, roleMatch: role } });
  } catch (error) {
    next(error);
  }
};

// @desc    Set or update active goal for current user
// @route   POST /api/users/me/goal
// @access  Private/Admin
export const setActiveGoalController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }
    const { role, title, focusSkills, targetDate } = req.body || {};
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    user.activeGoal = {
      role,
      title,
      focusSkills: Array.isArray(focusSkills) ? focusSkills : [],
      startedAt: user.activeGoal?.startedAt || new Date(),
      targetDate: targetDate ? new Date(targetDate) : user.activeGoal?.targetDate,
    } as any;
    await user.save();
    const roleMatch = await recomputeRoleMatch(new mongoose.Types.ObjectId(req.user._id), role);
    res.json({ success: true, message: 'Active goal updated', data: { activeGoal: user.activeGoal, roleMatch } });
  } catch (error) {
    next(error);
  }
};