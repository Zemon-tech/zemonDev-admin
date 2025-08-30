import { Request, Response, NextFunction } from 'express';
import ArenaChannel from '../models/arenaChannel.model';
import ArenaMessage from '../models/arenaMessage.model';
import UserChannelStatus from '../models/userChannelStatus.model';

// @desc    Get all channels
// @route   GET /api/channels
// @access  Private/Admin
export const getChannels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const channels = await ArenaChannel.find({});
    res.json(channels);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new channel
// @route   POST /api/channels
// @access  Private/Admin
export const createChannel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Validate required fields
    const { name, group, type, parentChannelId, description, isActive, permissions, moderators } = req.body;
    if (!name || !group || !type) {
      res.status(400).json({ message: 'Name, group, and type are required.' });
      return;
    }
    if (!req.user || !req.user._id) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    const newChannel = await ArenaChannel.create({
      name,
      group,
      type,
      parentChannelId: parentChannelId || null,
      description,
      isActive: typeof isActive === 'boolean' ? isActive : true,
      permissions: permissions || { canMessage: true, canRead: true },
      createdBy: req.user._id,
      moderators: moderators || [],
    });
    res.status(201).json(newChannel);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a channel (parent deletes all children)
// @route   DELETE /api/channels/:id
// @access  Private/Admin
export const deleteChannel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const channel = await ArenaChannel.findById(id);
    if (!channel) {
      res.status(404).json({ message: 'Channel not found' });
      return;
    }
    if (!channel.parentChannelId) {
      // Parent channel: delete all children and itself
      const children = await ArenaChannel.find({ parentChannelId: channel._id });
      const childIds = children.map((c) => c._id);
      await ArenaChannel.deleteMany({ parentChannelId: channel._id });
      await channel.deleteOne();
      res.json({ message: 'Parent channel and all its child channels deleted', deletedParent: channel._id, deletedChildren: childIds });
    } else {
      // Child channel: delete only itself
      await channel.deleteOne();
      res.json({ message: 'Child channel deleted', deleted: channel._id });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update a channel
// @route   PUT /api/channels/:id
// @access  Private/Admin
export const updateChannel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updateFields = req.body;
    // Optionally: validate fields here
    const updated = await ArenaChannel.findByIdAndUpdate(id, updateFields, { new: true });
    if (!updated) {
      res.status(404).json({ message: 'Channel not found' });
      return;
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get channel analytics and statistics
// @route   GET /api/channels/analytics
// @access  Private/Admin
export const getChannelAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get total channels
    const totalChannels = await ArenaChannel.countDocuments();
    
    // Get channels by type
    const channelsByType = await ArenaChannel.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get channels by group
    const channelsByGroup = await ArenaChannel.aggregate([
      {
        $group: {
          _id: '$group',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get channels by status
    const activeChannels = await ArenaChannel.countDocuments({ isActive: true });
    const inactiveChannels = await ArenaChannel.countDocuments({ isActive: false });
    
    // Get parent vs child channels
    const parentChannels = await ArenaChannel.countDocuments({ parentChannelId: null });
    const childChannels = await ArenaChannel.countDocuments({ parentChannelId: { $ne: null } });
    
    // Get total moderators across all channels
    const totalModerators = await ArenaChannel.aggregate([
      {
        $group: {
          _id: null,
          totalModerators: { $sum: { $size: '$moderators' } }
        }
      }
    ]);
    
    // Get recent channels (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentChannels = await ArenaChannel.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Get channels with most activity (message count)
    const channelsWithMessageCounts = await ArenaMessage.aggregate([
      {
        $group: {
          _id: '$channelId',
          messageCount: { $sum: 1 }
        }
      },
      {
        $sort: { messageCount: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    // Get user engagement per channel
    const userEngagement = await UserChannelStatus.aggregate([
      {
        $group: {
          _id: '$channelId',
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          channelId: 1,
          userCount: { $size: '$uniqueUsers' }
          }
        },
        {
          $sort: { userCount: -1 }
        },
        {
          $limit: 10
        }
      ]);
    
    res.json({
      totalChannels,
      channelsByType,
      channelsByGroup,
      activeChannels,
      inactiveChannels,
      parentChannels,
      childChannels,
      totalModerators: totalModerators[0]?.totalModerators || 0,
      recentChannels,
      channelsWithMessageCounts,
      userEngagement
    });
  } catch (error) {
    next(error);
  }
}; 