import { Request, Response, NextFunction } from 'express';
import CrucibleProblem from '../models/crucibleProblem.model';

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
        const { title, description, difficulty, tags, requirements, constraints, expectedOutcome, hints } = req.body;
        const problem = new CrucibleProblem({
            title,
            description,
            difficulty,
            tags,
            requirements,
            constraints,
            expectedOutcome,
            hints,
            createdBy: req.user?._id,
        });
        const createdProblem = await problem.save();
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
        const { title, description, difficulty, tags, requirements, constraints, expectedOutcome, hints } = req.body;
        const problem = await CrucibleProblem.findById(req.params.id);
        if (problem) {
            problem.title = title || problem.title;
            problem.description = description || problem.description;
            problem.difficulty = difficulty || problem.difficulty;
            problem.tags = tags || problem.tags;
            problem.requirements = requirements || problem.requirements;
            problem.constraints = constraints || problem.constraints;
            problem.expectedOutcome = expectedOutcome || problem.expectedOutcome;
            problem.hints = hints || problem.hints;
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