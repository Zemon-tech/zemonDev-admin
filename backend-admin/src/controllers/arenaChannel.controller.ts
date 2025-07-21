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