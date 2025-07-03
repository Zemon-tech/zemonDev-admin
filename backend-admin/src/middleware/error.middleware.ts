import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
    statusCode?: number;
}

const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    
    console.error(`[ERROR] ${err.statusCode} - ${err.message}\n`, err.stack);

    res.status(err.statusCode).json({
        message: err.message || 'Internal Server Error',
    });
};

export default errorHandler; 