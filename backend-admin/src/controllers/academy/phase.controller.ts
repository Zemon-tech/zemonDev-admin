import { Request, Response } from 'express';
import { getPhaseModel } from '../../models/academy/phase.model';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/AppError';

export const listPhases = asyncHandler(async (_req: Request, res: Response) => {
  const Phase = getPhaseModel();
  const phases = await Phase.find().sort({ order: 1 });
  res.json(phases);
});

export const getPhase = asyncHandler(async (req: Request, res: Response) => {
  const Phase = getPhaseModel();
  const phase = await Phase.findById(req.params.id);
  if (!phase) throw new AppError('Phase not found', 404);
  res.json(phase);
});

export const createPhase = asyncHandler(async (req: Request, res: Response) => {
  const Phase = getPhaseModel();
  const phase = await Phase.create(req.body);
  res.status(201).json(phase);
});

export const updatePhase = asyncHandler(async (req: Request, res: Response) => {
  const Phase = getPhaseModel();
  const phase = await Phase.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!phase) throw new AppError('Phase not found', 404);
  res.json(phase);
});

export const togglePhaseActive = asyncHandler(async (req: Request, res: Response) => {
  const Phase = getPhaseModel();
  const phase = await Phase.findById(req.params.id);
  if (!phase) throw new AppError('Phase not found', 404);
  phase.isActive = !phase.isActive;
  await phase.save();
  res.json(phase);
});

export const deletePhase = asyncHandler(async (req: Request, res: Response) => {
  const Phase = getPhaseModel();
  const phase = await Phase.findByIdAndDelete(req.params.id);
  if (!phase) throw new AppError('Phase not found', 404);
  res.json({ success: true });
});


