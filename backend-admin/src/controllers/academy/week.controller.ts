import { Request, Response } from 'express';
import { getWeekModel } from '../../models/academy/week.model';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/AppError';

export const listWeeks = asyncHandler(async (req: Request, res: Response) => {
  const Week = getWeekModel();
  const { phaseId } = req.query as { phaseId?: string };
  const query: any = {};
  if (phaseId) query.phaseId = phaseId;
  const weeks = await Week.find(query).sort({ weekNumber: 1 });
  res.json(weeks);
});

export const getWeek = asyncHandler(async (req: Request, res: Response) => {
  const Week = getWeekModel();
  const week = await Week.findById(req.params.id);
  if (!week) throw new AppError('Week not found', 404);
  res.json(week);
});

export const createWeek = asyncHandler(async (req: Request, res: Response) => {
  const Week = getWeekModel();
  const week = await Week.create(req.body);
  res.status(201).json(week);
});

export const updateWeek = asyncHandler(async (req: Request, res: Response) => {
  const Week = getWeekModel();
  const week = await Week.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!week) throw new AppError('Week not found', 404);
  res.json(week);
});

export const toggleWeekActive = asyncHandler(async (req: Request, res: Response) => {
  const Week = getWeekModel();
  const week = await Week.findById(req.params.id);
  if (!week) throw new AppError('Week not found', 404);
  week.isActive = !week.isActive;
  await week.save();
  res.json(week);
});

export const deleteWeek = asyncHandler(async (req: Request, res: Response) => {
  const Week = getWeekModel();
  const week = await Week.findByIdAndDelete(req.params.id);
  if (!week) throw new AppError('Week not found', 404);
  res.json({ success: true });
});


