import { Router } from 'express';
import {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
} from '../controllers/forge.controller';
import { protect, admin } from '../middleware/auth.middleware';

const router = Router();

router.route('/')
    .get(protect, admin, getResources)
    .post(protect, admin, createResource);

router.route('/:id')
    .get(protect, admin, getResourceById)
    .put(protect, admin, updateResource)
    .delete(protect, admin, deleteResource);

export default router; 