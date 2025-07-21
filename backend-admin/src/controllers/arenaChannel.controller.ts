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