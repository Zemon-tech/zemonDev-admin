import { Request, Response, NextFunction } from 'express';
import ForgeResource from '../models/forgeResource.model';

// @desc    Get all resources
// @route   GET /api/forge
// @access  Private/Admin
export const getResources = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const resources = await ForgeResource.find({});
        res.json(resources);
    } catch (error) {
        next(error);
    }
};

// @desc    Get resource by ID
// @route   GET /api/forge/:id
// @access  Private/Admin
export const getResourceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const resource = await ForgeResource.findById(req.params.id);
        if (resource) {
            res.json(resource);
        } else {
            res.status(404).json({ message: 'Resource not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Create a resource
// @route   POST /api/forge
// @access  Private/Admin
export const createResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { title, type, url, description, content, tags, difficulty, isExternal } = req.body;
        const resource = new ForgeResource({
            title,
            type,
            url,
            description,
            content,
            tags,
            difficulty,
            isExternal: typeof isExternal === 'boolean' ? isExternal : !!url,
            createdBy: req.user?._id, // Comes from protect middleware
        });
        const createdResource = await resource.save();
        res.status(201).json(createdResource);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a resource
// @route   PUT /api/forge/:id
// @access  Private/Admin
export const updateResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { title, type, url, description, content, tags, difficulty, isExternal } = req.body;
        const resource = await ForgeResource.findById(req.params.id);
        if (resource) {
            resource.title = title || resource.title;
            resource.type = type || resource.type;
            resource.url = url || '';
            resource.description = description || resource.description;
            resource.content = content || '';
            resource.tags = tags || resource.tags;
            resource.difficulty = difficulty || resource.difficulty;
            resource.isExternal = typeof isExternal === 'boolean' ? isExternal : !!url;
            const updatedResource = await resource.save();
            res.json(updatedResource);
        } else {
            res.status(404).json({ message: 'Resource not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a resource
// @route   DELETE /api/forge/:id
// @access  Private/Admin
export const deleteResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const resource = await ForgeResource.findById(req.params.id);
        if (resource) {
            await resource.deleteOne();
            res.json({ message: 'Resource removed' });
        } else {
            res.status(404).json({ message: 'Resource not found' });
        }
    } catch (error) {
        next(error);
    }
}; 