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
  getDashboardStats
} from '../controllers/crucible.controller';
import { protect, admin } from '../middleware/auth.middleware';

const router = Router();

// Dashboard stats
router.route('/dashboard')
    .get(protect, admin, getDashboardStats);

// Problem routes
router.route('/')
    .get(protect, admin, getProblems)
    .post(protect, admin, createProblem);

router.route('/:id')
    .get(protect, admin, getProblemById)
    .put(protect, admin, updateProblem)
    .delete(protect, admin, deleteProblem);

// Solution routes
router.route('/:problemId/solutions')
    .get(protect, admin, getSolutions);

router.route('/:problemId/solutions/:id')
    .get(protect, admin, getSolutionById)
    .put(protect, admin, updateSolution);

// Draft routes
router.route('/:problemId/drafts')
    .get(protect, admin, getDrafts);

router.route('/:problemId/drafts/:id')
    .get(protect, admin, getDraftById)
    .put(protect, admin, updateDraftStatus);

// Notes routes
router.route('/:problemId/notes')
    .get(protect, admin, getNotes);

router.route('/:problemId/notes/:id')
    .get(protect, admin, getNoteById);

// Chat routes
router.route('/:problemId/chats')
    .get(protect, admin, getChatSessions);

router.route('/:problemId/chats/:id')
    .get(protect, admin, getChatSessionById)
    .put(protect, admin, updateChatSessionStatus);

// Workspace state routes
router.route('/:problemId/workspace')
    .get(protect, admin, getWorkspaceStates);

router.route('/:problemId/workspace/:id')
    .get(protect, admin, getWorkspaceStateById);

// Diagram routes
router.route('/:problemId/diagrams')
    .get(protect, admin, getDiagrams);

router.route('/:problemId/diagrams/:id')
    .get(protect, admin, getDiagramById)
    .delete(protect, admin, deleteDiagram);

// Progress tracking routes
router.route('/:problemId/progress')
    .get(protect, admin, getProgressEntries);

router.route('/:problemId/progress/:id')
    .get(protect, admin, getProgressEntryById);

// Research item routes
router.route('/:problemId/research')
    .get(protect, admin, getResearchItems);

router.route('/:problemId/research/:id')
    .get(protect, admin, getResearchItemById)
    .delete(protect, admin, deleteResearchItem);

export default router; 