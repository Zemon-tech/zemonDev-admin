import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/user.controller';
import { protect, checkRole } from '../middleware/auth.middleware';

const router = Router();

router.use(...(protect as any));
router.use(checkRole(['admin']));

router.route('/').get(getUsers);
router.route('/:id').get(getUserById).put(updateUser).delete(deleteUser);

export default router;