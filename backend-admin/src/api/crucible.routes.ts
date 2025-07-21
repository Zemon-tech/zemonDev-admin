import { Router } from 'express';
import {
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
  getSolutions,
  getSolutionById,
  updateSolution,
  getDrafts,
  getDraftById,
  updateDraftStatus,
  getNotes,
  getNoteById,
  getChatSessions,
  getChatSessionById,
  updateChatSessionStatus,
  getWorkspaceStates,
  getWorkspaceStateById,
  getDiagrams,
  getDiagramById,
  deleteDiagram,
  getProgressEntries,
  getProgressEntryById,
  getResearchItems,
  getResearchItemById,
  deleteResearchItem,
  getDashboardStats,
} from '../controllers/crucible.controller';
import { protect, checkRole } from '../middleware/auth.middleware';

const router = Router();

router.use(...(protect as any));
router.use(checkRole(['admin']));

// Dashboard stats
router.route('/dashboard').get(getDashboardStats);

// Problem routes
router.route('/problems').get(getProblems).post(createProblem);
router.route('/problems/:id').get(getProblemById).put(updateProblem).delete(deleteProblem);

// Solution routes
router.route('/problems/:problemId/solutions').get(getSolutions);
router.route('/solutions/:id').get(getSolutionById).put(updateSolution);

// Draft routes
router.route('/problems/:problemId/drafts').get(getDrafts);
router.route('/drafts/:id').get(getDraftById).put(updateDraftStatus);

// Note routes
router.route('/problems/:problemId/notes').get(getNotes);
router.route('/notes/:id').get(getNoteById);

// Chat routes
router.route('/problems/:problemId/chats').get(getChatSessions);
router.route('/chats/:id').get(getChatSessionById).put(updateChatSessionStatus);

// Workspace state routes
router.route('/problems/:problemId/workspace').get(getWorkspaceStates);
router.route('/workspace/:id').get(getWorkspaceStateById);

// Diagram routes
router.route('/problems/:problemId/diagrams').get(getDiagrams);
router.route('/diagrams/:id').get(getDiagramById).delete(deleteDiagram);

// Progress tracking routes
router.route('/problems/:problemId/progress').get(getProgressEntries);
router.route('/progress/:id').get(getProgressEntryById);

// Research item routes
router.route('/problems/:problemId/research').get(getResearchItems);
router.route('/research/:id').get(getResearchItemById).delete(deleteResearchItem);

export default router; 