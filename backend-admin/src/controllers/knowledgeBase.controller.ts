import { Request, Response, NextFunction } from 'express';
import KnowledgeBaseDocument, { IKnowledgeBaseDocument } from '../models/knowledgeBaseDocument.model';
import { upsertDocumentVector, updateDocumentVector, deleteDocumentVectors } from '../services/knowledgeBase.service';
import mongoose from 'mongoose';

// @desc    Create a new knowledge base document
// @route   POST /api/admin/knowledge-base/documents
// @access  Private/Admin
export const createDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newDocument = new KnowledgeBaseDocument(req.body);
    const savedDocument = await newDocument.save() as IKnowledgeBaseDocument & { _id: mongoose.Types.ObjectId };
    
    // After saving to MongoDB, upsert to vector database
    await upsertDocumentVector(savedDocument._id.toString());
    
    res.status(201).json(savedDocument);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all knowledge base documents (paginated)
// @route   GET /api/admin/knowledge-base/documents
// @access  Private/Admin
export const getDocuments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const documents = await KnowledgeBaseDocument.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await KnowledgeBaseDocument.countDocuments();
    
    res.json({
      documents,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single knowledge base document by ID
// @route   GET /api/admin/knowledge-base/documents/:id
// @access  Private/Admin
export const getDocumentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const document = await KnowledgeBaseDocument.findById(req.params.id);
    if (document) {
      res.json(document);
    } else {
      res.status(404).json({ message: 'Document not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update a knowledge base document
// @route   PUT /api/admin/knowledge-base/documents/:id
// @access  Private/Admin
export const updateDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const document = await KnowledgeBaseDocument.findById(req.params.id) as IKnowledgeBaseDocument;
    if (document) {
      // Update document fields
      Object.assign(document, req.body);
      const updatedDocument = await document.save() as IKnowledgeBaseDocument & { _id: mongoose.Types.ObjectId };
      
      // After updating in MongoDB, update in vector database
      await updateDocumentVector(updatedDocument._id.toString());
      
      res.json(updatedDocument);
    } else {
      res.status(404).json({ message: 'Document not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a knowledge base document
// @route   DELETE /api/admin/knowledge-base/documents/:id
// @access  Private/Admin
export const deleteDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const document = await KnowledgeBaseDocument.findById(req.params.id) as IKnowledgeBaseDocument & { _id: mongoose.Types.ObjectId };
    if (document) {
      // Delete vectors from Upstash Vector
      await deleteDocumentVectors(document._id.toString());
      
      // Delete document from MongoDB
      await document.deleteOne();
      
      res.json({ message: 'Document removed' });
    } else {
      res.status(404).json({ message: 'Document not found' });
    }
  } catch (error) {
    next(error);
  }
}; 