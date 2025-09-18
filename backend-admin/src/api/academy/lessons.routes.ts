import { Router } from 'express';
import { protect, checkRole } from '../../middleware/auth.middleware';
import { listLessons, getLesson, createLesson, updateLesson, toggleLessonActive, deleteLesson } from '../../controllers/academy/lesson.controller';

const router = Router();

router.use(...(protect as any));
router.use(checkRole(['admin']));

router.route('/')
  .get(listLessons)
  .post(createLesson);

router.route('/:id')
  .get(getLesson)
  .put(updateLesson)
  .patch(updateLesson)
  .delete(deleteLesson);

router.route('/:id/toggle')
  .patch(toggleLessonActive);

export default router;



