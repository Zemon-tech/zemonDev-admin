import { Router } from 'express';
import { login } from '../controllers/auth.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/login', asyncHandler(login as any));

export default router; 