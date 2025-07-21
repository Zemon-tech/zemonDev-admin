import { Router } from 'express';
import {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
} from '../controllers/forge.controller';
import { protect, checkRole } from '../middleware/auth.middleware';

const router = Router();

router.use(...(protect as any));
router.use(checkRole(['admin']));

router.route('/').get(getResources).post(createResource);
router.route('/:id').get(getResourceById).put(updateResource).delete(deleteResource);

export default router; 