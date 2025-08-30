import express from 'express';
import { getChannels, createChannel, deleteChannel, updateChannel, getChannelAnalytics } from '../controllers/arenaChannel.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/channels - Get all channels (admin only)
// @ts-ignore
router.get('/channels', ...protect, getChannels);

// POST /api/channels - Create a new channel (admin only)
// @ts-ignore
router.post('/channels', ...protect, createChannel);

// PUT /api/channels/:id - Update a channel (admin only)
// @ts-ignore
router.put('/channels/:id', ...protect, updateChannel);

// DELETE /api/channels/:id - Delete a channel (admin only)
// @ts-ignore
router.delete('/channels/:id', ...protect, deleteChannel);

// GET /api/channels/analytics - Get channel analytics (admin only)
// @ts-ignore
router.get('/channels/analytics', ...protect, getChannelAnalytics);

export default router; 