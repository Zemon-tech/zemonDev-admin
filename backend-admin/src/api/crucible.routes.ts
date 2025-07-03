import { Router } from 'express';
import {
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
} from '../controllers/crucible.controller';
import { protect, admin } from '../middleware/auth.middleware';

const router = Router();

router.route('/')
    .get(protect, admin, getProblems)
    .post(protect, admin, createProblem);

router.route('/:id')
    .get(protect, admin, getProblemById)
    .put(protect, admin, updateProblem)
    .delete(protect, admin, deleteProblem);

export default router; 