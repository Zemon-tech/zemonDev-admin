import { Request, Response, NextFunction } from 'express';
import ArenaChannel from '../models/arenaChannel.model';

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