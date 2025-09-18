import { Router } from 'express';
import { protect, checkRole } from '../../middleware/auth.middleware';
import { listPhases, getPhase, createPhase, updatePhase, togglePhaseActive, deletePhase } from '../../controllers/academy/phase.controller';

const router = Router();

router.use(...(protect as any));
router.use(checkRole(['admin']));

router.route('/')
  .get(listPhases)
  .post(createPhase);

router.route('/:id')
  .get(getPhase)
  .put(updatePhase)
  .delete(deletePhase);

router.route('/:id/toggle')
  .patch(togglePhaseActive);

export default router;



