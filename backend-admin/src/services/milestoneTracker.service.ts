import User from '../models/user.model';
import Milestone from '../models/milestone.model';
import CrucibleSolution from '../models/crucibleSolution.model';
import { AppError } from '../utils/AppError';
import mongoose from 'mongoose';

export interface MilestoneCheckData {
  userId: string;
  action: 'problemSolved' | 'resourceCreated' | 'streakUpdated' | 'reputationChanged' | 'collaboration';
  value?: number;
  metadata?: any;
}

export class MilestoneTrackerService {
  /**
   * Check and award milestones based on user actions
   */
  static async checkMilestones(checkData: MilestoneCheckData): Promise<any[]> {
    try {
      const { userId, action, value, metadata } = checkData;

      // Get user
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Get all active milestones
      const activeMilestones = await Milestone.find({ isActive: true });
      const newlyAwardedMilestones = [];

      // Check each milestone
      for (const milestone of activeMilestones) {
        // Skip if user already has this milestone
        if (user.milestones.includes(milestone._id as mongoose.Types.ObjectId)) {
          continue;
        }

        // Check if milestone criteria are met
        if (await this.checkMilestoneCriteria(user, milestone, action, value, metadata)) {
          // Award milestone
          user.milestones.push(milestone._id as mongoose.Types.ObjectId);
          user.stats.reputation += milestone.points;
          newlyAwardedMilestones.push({
            milestoneId: milestone._id,
            name: milestone.name,
            description: milestone.description,
            category: milestone.category,
            level: milestone.level,
            points: milestone.points,
          });
        }
      }

      if (newlyAwardedMilestones.length > 0) {
        await user.save();
      }

      return newlyAwardedMilestones;
    } catch (error) {
      throw new AppError(`Failed to check milestones: ${error.message}`, 500);
    }
  }

  /**
   * Check if a specific milestone criteria are met
   */
  private static async checkMilestoneCriteria(
    user: any,
    milestone: any,
    action: string,
    value?: number,
    metadata?: any
  ): Promise<boolean> {
    const { requirement } = milestone;
    return await this.evaluateRequirement(user, requirement, action, value, metadata);
  }

  /**
   * Evaluate a milestone requirement using actual data
   */
  private static async evaluateRequirement(
    user: any,
    requirement: any,
    action: string,
    value?: number,
    metadata?: any
  ): Promise<boolean> {
    const { type, value: requiredValue } = requirement;

    let actualValue: number;

    switch (type) {
      case 'problemsSolved':
        // Use actual reviewed solutions count
        const reviewedSolutions = await CrucibleSolution.countDocuments({
          userId: user._id,
          status: 'reviewed'
        });
        actualValue = reviewedSolutions;
        break;
        
      case 'resourcesCreated':
        actualValue = user.stats.resourcesCreated;
        break;
        
      case 'reputation':
        actualValue = user.stats.reputation;
        break;
        
      case 'streak':
        // Calculate actual streak from solution submissions
        actualValue = await this.calculateUserStreak(user._id);
        break;
        
      case 'collaboration':
        // Calculate collaboration score based on reviews given/received
        actualValue = await this.calculateCollaborationScore(user._id);
        break;
        
      default:
        return false;
    }

    return actualValue >= requiredValue;
  }

  /**
   * Calculate user's current streak based on actual solution submissions
   */
  private static async calculateUserStreak(userId: string | mongoose.Types.ObjectId): Promise<number> {
    try {
      // Get all reviewed solutions for this user
      const solutions = await CrucibleSolution.find({
        userId: userId,
        status: 'reviewed'
      })
      .sort({ submittedAt: -1 })
      .select('submittedAt');

      if (solutions.length === 0) return 0;

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check consecutive days with solutions
      for (let i = 0; i < solutions.length; i++) {
        const solutionDate = new Date(solutions[i].submittedAt);
        solutionDate.setHours(0, 0, 0, 0);

        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - streak);

        if (solutionDate.getTime() === expectedDate.getTime()) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating user streak:', error);
      return 0;
    }
  }

  /**
   * Calculate collaboration score based on reviews given and received
   */
  private static async calculateCollaborationScore(userId: mongoose.Types.ObjectId): Promise<number> {
    try {
      // Count reviews given by this user
      const reviewsGiven = await CrucibleSolution.countDocuments({
        'reviews.userId': userId
      });

      // Count reviews received by this user's solutions
      const reviewsReceived = await CrucibleSolution.aggregate([
        { $match: { userId: userId } },
        { $unwind: '$reviews' },
        { $count: 'totalReviews' }
      ]);

      const totalReviewsReceived = reviewsReceived.length > 0 ? reviewsReceived[0].totalReviews : 0;

      // Calculate collaboration score (reviews given + received)
      return reviewsGiven + totalReviewsReceived;
    } catch (error) {
      console.error('Error calculating collaboration score:', error);
      return 0;
    }
  }

  /**
   * Get user milestones summary with actual data
   */
  static async getUserMilestones(userId: string): Promise<any> {
    try {
      const user = await User.findById(userId).populate('milestones');
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Get actual solution statistics
      const solutions = await CrucibleSolution.find({
        userId: user._id,
        status: 'reviewed'
      }).select('metrics.score submittedAt');

      const totalSolutions = solutions.length;
      const averageScore = totalSolutions > 0 
        ? solutions.reduce((sum, sol) => sum + (sol.metrics?.score || 0), 0) / totalSolutions 
        : 0;

      const milestones = user.milestones.map((milestone: any) => ({
        id: milestone._id,
        name: milestone.name,
        description: milestone.description,
        category: milestone.category,
        level: milestone.level,
        points: milestone.points,
        iconUrl: milestone.iconUrl,
        awardedAt: user.updatedAt, // This would ideally be stored separately
      }));

      const totalPoints = milestones.reduce((sum, milestone) => sum + milestone.points, 0);

      // Group by category and level
      const milestonesByCategory = milestones.reduce((acc, milestone) => {
        if (!acc[milestone.category]) {
          acc[milestone.category] = {};
        }
        if (!acc[milestone.category][milestone.level]) {
          acc[milestone.category][milestone.level] = [];
        }
        acc[milestone.category][milestone.level].push(milestone);
        return acc;
      }, {});

      return {
        milestones,
        milestonesByCategory,
        totalPoints,
        totalMilestones: milestones.length,
        reputation: user.stats.reputation,
        actualSolutions: totalSolutions,
        averageScore: Math.round(averageScore * 100) / 100,
        currentStreak: await this.calculateUserStreak(user._id),
      };
    } catch (error) {
      throw new AppError(`Failed to get user milestones: ${error.message}`, 500);
    }
  }

  /**
   * Get next milestones for user with actual progress data
   */
  static async getNextMilestones(userId: string): Promise<any[]> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const allMilestones = await Milestone.find({ isActive: true });
      const userMilestoneIds = user.milestones.map(m => m.toString());
      
      const nextMilestones = allMilestones
        .filter(milestone => !userMilestoneIds.includes(milestone._id.toString()))
        .map(milestone => {
          const currentValue = this.getCurrentValueForMilestone(user, milestone);
          const progress = Math.min((currentValue / milestone.requirement.value) * 100, 100);
          
          return {
            id: milestone._id,
            name: milestone.name,
            description: milestone.description,
            category: milestone.category,
            level: milestone.level,
            requirement: milestone.requirement,
            currentValue,
            progress,
            points: milestone.points,
          };
        })
        .sort((a, b) => a.progress - b.progress)
        .slice(0, 5);

      return nextMilestones;
    } catch (error) {
      throw new AppError(`Failed to get next milestones: ${error.message}`, 500);
    }
  }

  /**
   * Get current value for a specific milestone type using actual data
   */
  private static async getCurrentValueForMilestone(user: any, milestone: any): Promise<number> {
    const { type } = milestone.requirement;
    
    switch (type) {
      case 'problemsSolved':
        // Use actual reviewed solutions count
        return await CrucibleSolution.countDocuments({
          userId: user._id,
          status: 'reviewed'
        });
        
      case 'resourcesCreated':
        return user.stats.resourcesCreated;
        
      case 'reputation':
        return user.stats.reputation;
        
      case 'streak':
        return await this.calculateUserStreak(user._id);
        
      case 'collaboration':
        return await this.calculateCollaborationScore(user._id);
        
      default:
        return 0;
    }
  }

  /**
   * Get available milestones for admin management
   */
  static async getAvailableMilestones(): Promise<any[]> {
    try {
      const milestones = await Milestone.find({ isActive: true })
        .sort({ category: 1, level: 1, name: 1 });
      
      return milestones.map(milestone => ({
        id: milestone._id,
        name: milestone.name,
        description: milestone.description,
        category: milestone.category,
        level: milestone.level,
        requirement: milestone.requirement,
        points: milestone.points,
        iconUrl: milestone.iconUrl,
        isActive: milestone.isActive,
        createdAt: milestone.createdAt,
      }));
    } catch (error) {
      throw new AppError(`Failed to get available milestones: ${error.message}`, 500);
    }
  }

  /**
   * Trigger milestone check when a solution is reviewed
   * This should be called from the Crucible controller when a solution is reviewed
   */
  static async checkMilestonesOnSolutionReview(userId: string, solutionScore: number): Promise<any[]> {
    try {
      // Check milestones based on problem solved
      const milestones = await this.checkMilestones({
        userId,
        action: 'problemSolved',
        value: solutionScore,
        metadata: { solutionScore }
      });

      // Also check streak milestones
      const streakMilestones = await this.checkMilestones({
        userId,
        action: 'streakUpdated',
        value: await this.calculateUserStreak(userId.toString()),
        metadata: { type: 'solution_submission' }
      });

      return [...milestones, ...streakMilestones];
    } catch (error) {
      throw new AppError(`Failed to check milestones on solution review: ${error.message}`, 500);
    }
  }
}
