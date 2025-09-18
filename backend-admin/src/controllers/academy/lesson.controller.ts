import { Request, Response } from 'express';
import { getLessonModel } from '../../models/academy/lesson.model';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/AppError';

function validateLessonPayload(payload: any, isCreate: boolean) {
  const allowedTypes = ['video','workshop','project','reading','quiz','assignment'];
  if (payload.type && !allowedTypes.includes(payload.type)) {
    throw new AppError('Invalid lesson type', 400);
  }

  if (isCreate) {
    const required = ['weekId','dayNumber','title','type','order'];
    for (const k of required) {
      if (payload[k] === undefined || payload[k] === null || payload[k] === '') {
        throw new AppError(`Missing required field: ${k}`, 400);
      }
    }
  }

  if (payload.points !== undefined) {
    if (typeof payload.points !== 'number' || payload.points < 0 || payload.points > 1000) {
      throw new AppError('points must be a number between 0 and 1000', 400);
    }
  }

  if (payload.content) {
    const c = payload.content;
    if (payload.type === 'video' && !c.videoUrl) {
      throw new AppError('video lesson requires content.videoUrl', 400);
    }
    if (payload.type === 'reading' && !c.readingUrl) {
      throw new AppError('reading lesson requires content.readingUrl', 400);
    }

    if (c.resources && Array.isArray(c.resources)) {
      const allowedResourceTypes = ['youtube','pdf','notion','link','meet'];
      for (const r of c.resources) {
        if (r.type && !allowedResourceTypes.includes(r.type)) {
          throw new AppError('Invalid resource.type in content.resources', 400);
        }
      }
    }
  }
}

export const listLessons = asyncHandler(async (req: Request, res: Response) => {
  const Lesson = getLessonModel();
  const { weekId, phaseId } = req.query as { weekId?: string; phaseId?: string };
  const query: any = {};
  if (weekId) query.weekId = weekId;
  // If phaseId is provided, we still allow direct weekId use on admin; otherwise it requires join
  const lessons = await Lesson.find(query).sort({ order: 1 });
  res.json(lessons);
});

export const getLesson = asyncHandler(async (req: Request, res: Response) => {
  const Lesson = getLessonModel();
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) throw new AppError('Lesson not found', 404);
  res.json(lesson);
});

export const createLesson = asyncHandler(async (req: Request, res: Response) => {
  const Lesson = getLessonModel();
  const body = req.body || {};
  validateLessonPayload(body, true);
  const lesson = await Lesson.create(body);
  res.status(201).json(lesson);
});

export const updateLesson = asyncHandler(async (req: Request, res: Response) => {
  const Lesson = getLessonModel();
  const body = req.body || {};
  validateLessonPayload(body, false);
  const lesson = await Lesson.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
  if (!lesson) throw new AppError('Lesson not found', 404);
  res.json(lesson);
});

export const toggleLessonActive = asyncHandler(async (req: Request, res: Response) => {
  const Lesson = getLessonModel();
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) throw new AppError('Lesson not found', 404);
  lesson.isActive = !lesson.isActive;
  await lesson.save();
  res.json(lesson);
});

export const deleteLesson = asyncHandler(async (req: Request, res: Response) => {
  const Lesson = getLessonModel();
  const lesson = await Lesson.findByIdAndDelete(req.params.id);
  if (!lesson) throw new AppError('Lesson not found', 404);
  res.json({ success: true });
});


