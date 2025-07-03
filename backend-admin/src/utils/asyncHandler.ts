import { Request, Response, NextFunction, RequestHandler } from 'express';

const asyncHandler = (theFunc: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(theFunc(req, res, next)).catch(next);
};

export { asyncHandler }; 