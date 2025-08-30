import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../models/user.model';
import CrucibleProblem from '../models/crucibleProblem.model';
import CrucibleSolution from '../models/crucibleSolution.model';
import SolutionDraft from '../models/solutionDraft.model';
import CrucibleNote from '../models/crucibleNote.model';
import AIChatHistory from '../models/aiChatHistory.model';
import WorkspaceState from '../models/workspaceState.model';
import CrucibleDiagram from '../models/crucibleDiagram.model';
import ProgressTracking from '../models/progressTracking.model';
import ResearchItem from '../models/researchItem.model';
import { NotificationTriggers } from '../services/notificationTriggers.service';

// @desc    Get all problems
// @route   GET /api/crucible
// @access  Private/Admin
export const getProblems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const problems = await CrucibleProblem.find({});
        res.json(problems);
    } catch (error) {
        next(error);
    }
};

// @desc    Get problem by ID
// @route   GET /api/crucible/:id
// @access  Private/Admin
export const getProblemById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const problem = await CrucibleProblem.findById(req.params.id);
        if (problem) {
            res.json(problem);
        } else {
            res.status(404).json({ message: 'Problem not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Create a problem
// @route   POST /api/crucible
// @access  Private/Admin
export const createProblem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.auth || !req.auth.userId) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const { 
            title, 
            description, 
            thumbnailUrl,
            category,
            difficulty, 
            tags, 
            requirements, 
            constraints, 
            expectedOutcome, 
            hints,
            learningObjectives,
            prerequisites,
            userPersona,
            resources,
            aiHints,
            status,
            estimatedTime,
            dataAssumptions,
            edgeCases,
            relatedResources,
            subtasks,
            communityTips,
            aiPrompts,
            technicalParameters
        } = req.body;
        
        // Validate requirements structure
        const validateRequirements = (reqs: any) => {
            if (!reqs || typeof reqs !== 'object') return false;
            
            const validateArray = (arr: any[]) => {
                if (!Array.isArray(arr)) return false;
                return arr.every(item => 
                    item && typeof item === 'object' && 
                    typeof item.requirement === 'string' && 
                    item.requirement.trim() !== '' &&
                    typeof item.context === 'string'
                );
            };
            
            return validateArray(reqs.functional || []) && validateArray(reqs.nonFunctional || []);
        };
        
        if (requirements && !validateRequirements(requirements)) {
            res.status(400).json({ 
                message: 'Invalid requirements structure. Each requirement must have a "requirement" field (required) and a "context" field (optional).' 
            });
            return;
        }
        
        // Find the user by clerkId first
        const user = await User.findOne({ clerkId: req.auth.userId });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const problem = new CrucibleProblem({
            title,
            description,
            thumbnailUrl,
            category,
            difficulty,
            tags,
            requirements,
            constraints,
            expectedOutcome,
            hints,
            learningObjectives,
            prerequisites,
            userPersona,
            resources,
            aiHints,
            status,
            estimatedTime,
            dataAssumptions,
            edgeCases,
            relatedResources,
            subtasks,
            communityTips,
            aiPrompts,
            technicalParameters,
            createdBy: user._id as mongoose.Types.ObjectId, // Use the actual MongoDB ObjectId from the user document
        });
        const createdProblem = await problem.save();
        
        // Trigger notification for new problem
        await NotificationTriggers.onProblemCreated(createdProblem);
        
        res.status(201).json(createdProblem);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a problem
// @route   PUT /api/crucible/:id
// @access  Private/Admin
export const updateProblem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { 
            title, 
            description, 
            thumbnailUrl,
            category,
            difficulty, 
            tags, 
            requirements, 
            constraints, 
            expectedOutcome, 
            hints,
            learningObjectives,
            prerequisites,
            userPersona,
            resources,
            aiHints,
            status,
            estimatedTime,
            dataAssumptions,
            edgeCases,
            relatedResources,
            subtasks,
            communityTips,
            aiPrompts,
            technicalParameters
        } = req.body;
        
        // Validate requirements structure if provided
        if (requirements !== undefined) {
            const validateRequirements = (reqs: any) => {
                if (!reqs || typeof reqs !== 'object') return false;
                
                const validateArray = (arr: any[]) => {
                    if (!Array.isArray(arr)) return false;
                    return arr.every(item => 
                        item && typeof item === 'object' && 
                        typeof item.requirement === 'string' && 
                        item.requirement.trim() !== '' &&
                        typeof item.context === 'string'
                    );
                };
                
                return validateArray(reqs.functional || []) && validateArray(reqs.nonFunctional || []);
            };
            
            if (!validateRequirements(requirements)) {
                res.status(400).json({ 
                    message: 'Invalid requirements structure. Each requirement must have a "requirement" field (required) and a "context" field (optional).' 
                });
                return;
            }
        }
        
        const problem = await CrucibleProblem.findById(req.params.id);
        if (problem) {
            if (title !== undefined) problem.title = title;
            if (description !== undefined) problem.description = description;
            // @ts-ignore
            if (thumbnailUrl !== undefined) problem.thumbnailUrl = thumbnailUrl;
            if (category !== undefined) problem.category = category;
            if (difficulty !== undefined) problem.difficulty = difficulty;
            if (tags !== undefined) problem.tags = tags;
            if (requirements !== undefined) problem.requirements = requirements;
            if (constraints !== undefined) problem.constraints = constraints;
            if (expectedOutcome !== undefined) problem.expectedOutcome = expectedOutcome;
            if (hints !== undefined) problem.hints = hints;
            if (learningObjectives !== undefined) problem.learningObjectives = learningObjectives;
            if (prerequisites !== undefined) problem.prerequisites = prerequisites;
            // @ts-ignore
            if (userPersona !== undefined) (problem as any).userPersona = userPersona;
            if (resources !== undefined) problem.resources = resources;
            if (aiHints !== undefined) problem.aiHints = aiHints;
            if (status !== undefined) problem.status = status;
            // @ts-ignore
            if (estimatedTime !== undefined) problem.estimatedTime = estimatedTime;
            // @ts-ignore
            if (dataAssumptions !== undefined) problem.dataAssumptions = dataAssumptions;
            // @ts-ignore
            if (edgeCases !== undefined) problem.edgeCases = edgeCases;
            // @ts-ignore
            if (relatedResources !== undefined) problem.relatedResources = relatedResources;
            // @ts-ignore
            if (subtasks !== undefined) problem.subtasks = subtasks;
            // @ts-ignore
            if (communityTips !== undefined) problem.communityTips = communityTips;
            // @ts-ignore
            if (aiPrompts !== undefined) problem.aiPrompts = aiPrompts;
            // @ts-ignore
            if (technicalParameters !== undefined) problem.technicalParameters = technicalParameters;

            const updatedProblem = await problem.save();
            res.json(updatedProblem);
        } else {
            res.status(404).json({ message: 'Problem not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a problem
// @route   DELETE /api/crucible/:id
// @access  Private/Admin
export const deleteProblem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const problem = await CrucibleProblem.findById(req.params.id);
        if (problem) {
            await problem.deleteOne();
            res.json({ message: 'Problem removed' });
        } else {
            res.status(404).json({ message: 'Problem not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get all solutions for a problem
// @route   GET /api/crucible/:problemId/solutions
// @access  Private/Admin
export const getSolutions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { problemId } = req.params;
        const solutions = await CrucibleSolution.find({ problemId }).populate('userId', 'fullName email');
        res.json(solutions);
    } catch (error) {
        next(error);
    }
};

// @desc    Get solution by ID
// @route   GET /api/crucible/:problemId/solutions/:id
// @access  Private/Admin
export const getSolutionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const solution = await CrucibleSolution.findById(id).populate('userId', 'fullName email');
        if (solution) {
            res.json(solution);
        } else {
            res.status(404).json({ message: 'Solution not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update solution status or add review
// @route   PUT /api/crucible/:problemId/solutions/:id
// @access  Private/Admin
export const updateSolution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.auth || !req.auth.userId) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const { id } = req.params;
        const { status, aiAnalysis, review } = req.body;
        
        const solution = await CrucibleSolution.findById(id);
        if (!solution) {
            res.status(404).json({ message: 'Solution not found' });
            return;
        }
        
        if (status) {
            solution.status = status;
        }
        
        if (aiAnalysis) {
            solution.aiAnalysis = {
                ...solution.aiAnalysis,
                ...aiAnalysis
            };
        }
        
        if (review) {
            // Find the user by clerkId first
            const user = await User.findOne({ clerkId: req.auth.userId });
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            
            solution.reviews.push({
                userId: user._id as mongoose.Types.ObjectId, // Use the actual MongoDB ObjectId
                rating: review.rating,
                comment: review.comment,
                reviewedAt: new Date(),
            });
        }
        
        const updatedSolution = await solution.save();
        res.json(updatedSolution);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all solution drafts for a problem
// @route   GET /api/crucible/:problemId/drafts
// @access  Private/Admin
export const getDrafts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { problemId } = req.params;
        const { userId } = req.query;
        
        const query: any = { problemId };
        if (userId) {
            query.userId = userId;
        }
        
        const drafts = await SolutionDraft.find(query).populate('userId', 'fullName email');
        res.json(drafts);
    } catch (error) {
        next(error);
    }
};

// @desc    Get draft by ID
// @route   GET /api/crucible/:problemId/drafts/:id
// @access  Private/Admin
export const getDraftById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const draft = await SolutionDraft.findById(id).populate('userId', 'fullName email');
        if (draft) {
            res.json(draft);
        } else {
            res.status(404).json({ message: 'Draft not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update draft status (archive/unarchive)
// @route   PUT /api/crucible/:problemId/drafts/:id
// @access  Private/Admin
export const updateDraftStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const draft = await SolutionDraft.findById(id);
        if (!draft) {
            res.status(404).json({ message: 'Draft not found' });
            return;
        }
        
        draft.status = status;
        const updatedDraft = await draft.save();
        res.json(updatedDraft);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all notes for a problem
// @route   GET /api/crucible/:problemId/notes
// @access  Private/Admin
export const getNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { problemId } = req.params;
        const { userId } = req.query;
        
        const query: any = { problemId };
        if (userId) {
            query.userId = userId;
        }
        
        const notes = await CrucibleNote.find(query).populate('userId', 'fullName email');
        res.json(notes);
    } catch (error) {
        next(error);
    }
};

// @desc    Get note by ID
// @route   GET /api/crucible/:problemId/notes/:id
// @access  Private/Admin
export const getNoteById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const note = await CrucibleNote.findById(id).populate('userId', 'fullName email');
        if (note) {
            res.json(note);
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get all chat sessions for a problem
// @route   GET /api/crucible/:problemId/chats
// @access  Private/Admin
export const getChatSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { problemId } = req.params;
        const { userId } = req.query;
        
        const query: any = { problemId };
        if (userId) {
            query.userId = userId;
        }
        
        const chatSessions = await AIChatHistory.find(query).populate('userId', 'fullName email');
        res.json(chatSessions);
    } catch (error) {
        next(error);
    }
};

// @desc    Get chat session by ID
// @route   GET /api/crucible/:problemId/chats/:id
// @access  Private/Admin
export const getChatSessionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const chatSession = await AIChatHistory.findById(id).populate('userId', 'fullName email');
        if (chatSession) {
            res.json(chatSession);
        } else {
            res.status(404).json({ message: 'Chat session not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update chat session status (archive/unarchive)
// @route   PUT /api/crucible/:problemId/chats/:id
// @access  Private/Admin
export const updateChatSessionStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, tags } = req.body;
        
        const chatSession = await AIChatHistory.findById(id);
        if (!chatSession) {
            res.status(404).json({ message: 'Chat session not found' });
            return;
        }
        
        if (status) {
            chatSession.status = status;
        }
        
        if (tags) {
            chatSession.tags = tags;
        }
        
        const updatedChatSession = await chatSession.save();
        res.json(updatedChatSession);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all workspace states for a problem
// @route   GET /api/crucible/:problemId/workspace
// @access  Private/Admin
export const getWorkspaceStates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { problemId } = req.params;
        const { userId } = req.query;
        
        const query: any = { problemId };
        if (userId) {
            query.userId = userId;
        }
        
        const workspaceStates = await WorkspaceState.find(query).populate('userId', 'fullName email');
        res.json(workspaceStates);
    } catch (error) {
        next(error);
    }
};

// @desc    Get workspace state by ID
// @route   GET /api/crucible/:problemId/workspace/:id
// @access  Private/Admin
export const getWorkspaceStateById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const workspaceState = await WorkspaceState.findById(id).populate('userId', 'fullName email');
        if (workspaceState) {
            res.json(workspaceState);
        } else {
            res.status(404).json({ message: 'Workspace state not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get all diagrams for a problem
// @route   GET /api/crucible/:problemId/diagrams
// @access  Private/Admin
export const getDiagrams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { problemId } = req.params;
        const { userId } = req.query;
        
        const query: any = { problemId };
        if (userId) {
            query.userId = userId;
        }
        
        const diagrams = await CrucibleDiagram.find(query).populate('userId', 'fullName email');
        res.json(diagrams);
    } catch (error) {
        next(error);
    }
};

// @desc    Get diagram by ID
// @route   GET /api/crucible/:problemId/diagrams/:id
// @access  Private/Admin
export const getDiagramById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const diagram = await CrucibleDiagram.findById(id).populate('userId', 'fullName email');
        if (diagram) {
            res.json(diagram);
        } else {
            res.status(404).json({ message: 'Diagram not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete diagram
// @route   DELETE /api/crucible/:problemId/diagrams/:id
// @access  Private/Admin
export const deleteDiagram = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const diagram = await CrucibleDiagram.findById(id);
        if (diagram) {
            await diagram.deleteOne();
            res.json({ message: 'Diagram removed' });
        } else {
            res.status(404).json({ message: 'Diagram not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get all progress tracking entries for a problem
// @route   GET /api/crucible/:problemId/progress
// @access  Private/Admin
export const getProgressEntries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { problemId } = req.params;
        const { userId } = req.query;
        
        const query: any = { problemId };
        if (userId) {
            query.userId = userId;
        }
        
        const progressEntries = await ProgressTracking.find(query).populate('userId', 'fullName email');
        res.json(progressEntries);
    } catch (error) {
        next(error);
    }
};

// @desc    Get progress entry by ID
// @route   GET /api/crucible/:problemId/progress/:id
// @access  Private/Admin
export const getProgressEntryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const progressEntry = await ProgressTracking.findById(id).populate('userId', 'fullName email');
        if (progressEntry) {
            res.json(progressEntry);
        } else {
            res.status(404).json({ message: 'Progress entry not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get all research items for a problem
// @route   GET /api/crucible/:problemId/research
// @access  Private/Admin
export const getResearchItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { problemId } = req.params;
        const { userId } = req.query;
        
        const query: any = { problemId };
        if (userId) {
            query.userId = userId;
        }
        
        const researchItems = await ResearchItem.find(query).populate('userId', 'fullName email');
        res.json(researchItems);
    } catch (error) {
        next(error);
    }
};

// @desc    Get research item by ID
// @route   GET /api/crucible/:problemId/research/:id
// @access  Private/Admin
export const getResearchItemById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const researchItem = await ResearchItem.findById(id).populate('userId', 'fullName email');
        if (researchItem) {
            res.json(researchItem);
        } else {
            res.status(404).json({ message: 'Research item not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete research item
// @route   DELETE /api/crucible/:problemId/research/:id
// @access  Private/Admin
export const deleteResearchItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const researchItem = await ResearchItem.findById(id);
        if (researchItem) {
            await researchItem.deleteOne();
            res.json({ message: 'Research item removed' });
        } else {
            res.status(404).json({ message: 'Research item not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get dashboard stats for crucible
// @route   GET /api/crucible/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Total problems
        const totalProblems = await CrucibleProblem.countDocuments();
        
        // Problems by status
        const problemsByStatus = await CrucibleProblem.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Problems by difficulty
        const problemsByDifficulty = await CrucibleProblem.aggregate([
            {
                $group: {
                    _id: '$difficulty',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Total solutions
        const totalSolutions = await CrucibleSolution.countDocuments();
        
        // Solutions by status
        const solutionsByStatus = await CrucibleSolution.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Recent solutions
        const recentSolutions = await CrucibleSolution.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'fullName email')
            .populate('problemId', 'title');
        
        // Active users (users with recent activity)
        const activeUsers = await CrucibleSolution.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
                }
            },
            {
                $group: {
                    _id: '$userId',
                    count: { $sum: 1 }
                }
            },
            {
                $count: 'activeUsers'
            }
        ]);
        
        res.json({
            totalProblems,
            problemsByStatus,
            problemsByDifficulty,
            totalSolutions,
            solutionsByStatus,
            recentSolutions,
            activeUsers: activeUsers[0]?.activeUsers || 0
        });
    } catch (error) {
        next(error);
    }
}; 