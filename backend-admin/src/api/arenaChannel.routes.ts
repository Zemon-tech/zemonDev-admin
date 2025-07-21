import express from 'express';
import { getChannels, createChannel, deleteChannel } from '../controllers/arenaChannel.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/channels - Get all channels (admin only)
// @ts-ignore
router.get('/channels', ...protect, getChannels);

// POST /api/channels - Create a new channel (admin only)
// @ts-ignore
router.post('/channels', ...protect, createChannel);

// DELETE /api/channels/:id - Delete a channel (admin only)
// @ts-ignore
router.delete('/channels/:id', ...protect, deleteChannel);

export default router; 