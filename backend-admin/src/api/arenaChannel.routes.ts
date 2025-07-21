import express from 'express';
import { getChannels } from '../controllers/arenaChannel.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/channels - Get all channels (admin only)
// @ts-ignore
router.get('/channels', ...protect, getChannels);

export default router; 