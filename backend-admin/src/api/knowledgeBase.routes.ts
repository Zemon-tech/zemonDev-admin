import { Router } from 'express';
import {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
} from '../controllers/knowledgeBase.controller';
import { protect, admin } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected and require admin access
router.route('/')
  .post(protect, admin, createDocument)
  .get(protect, admin, getDocuments);

router.route('/:id')
  .get(protect, admin, getDocumentById)
  .put(protect, admin, updateDocument)
  .delete(protect, admin, deleteDocument);

export default router; 