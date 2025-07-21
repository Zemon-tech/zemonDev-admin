import { Router } from 'express';
import {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
} from '../controllers/knowledgeBase.controller';
import { protect, checkRole } from '../middleware/auth.middleware';

const router = Router();

router.use(...(protect as any));
router.use(checkRole(['admin']));

router.route('/').get(getDocuments).post(createDocument);
router.route('/:id').get(getDocumentById).put(updateDocument).delete(deleteDocument);

export default router; 