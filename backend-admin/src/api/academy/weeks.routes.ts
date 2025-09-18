import { Router } from 'express';
import { protect, checkRole } from '../../middleware/auth.middleware';
import { listWeeks, getWeek, createWeek, updateWeek, toggleWeekActive, deleteWeek } from '../../controllers/academy/week.controller';

const router = Router();

router.use(...(protect as any));
router.use(checkRole(['admin']));

router.route('/')
  .get(listWeeks)
  .post(createWeek);

router.route('/:id')
  .get(getWeek)
  .put(updateWeek)
  .delete(deleteWeek);

router.route('/:id/toggle')
  .patch(toggleWeekActive);

export default router;



