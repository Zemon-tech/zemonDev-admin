import { Request } from 'express';

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export interface LogContext {
  userId?: string;
  requestId?: string;
  operation?: string;
  filename?: string;
  fileSize?: number;
  bucket?: string;
  url?: string;
  [key: string]: any;
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;

  private constructor() {
    // Set log level based on environment
    const envLogLevel = process.env.LOG_LEVEL?.toUpperCase() as LogLevel;
    this.logLevel = envLogLevel || (process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG);
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    return levels.indexOf(level) <= levels.indexOf(this.logLevel);
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext, error?: Error): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context, null, 2) : '';
    const errorStr = error ? `\nError: ${error.message}\nStack: ${error.stack}` : '';
    
    return `[${timestamp}] [${level}] ${message}${contextStr ? `\nContext: ${contextStr}` : ''}${errorStr}`;
  }

  public error(message: string, context?: LogContext, error?: Error): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(LogLevel.ERROR, message, context, error));
    }
  }

  public warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, context));
    }
  }

  public info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage(LogLevel.INFO, message, context));
    }
  }

  public debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  // Specialized logging methods for upload operations
  public uploadStart(filename: string, fileSize: number, context?: LogContext): void {
    this.info('Image upload started', {
      ...context,
      operation: 'upload_start',
      filename,
      fileSize
    });
  }

  public uploadSuccess(filename: string, url: string, context?: LogContext): void {
    this.info('Image upload successful', {
      ...context,
      operation: 'upload_success',
      filename,
      url
    });
  }

  public uploadError(filename: string, error: Error, context?: LogContext): void {
    this.error('Image upload failed', {
      ...context,
      operation: 'upload_error',
      filename
    }, error);
  }

  public deleteStart(url: string, context?: LogContext): void {
    this.info('Image deletion started', {
      ...context,
      operation: 'delete_start',
      url
    });
  }

  public deleteSuccess(url: string, context?: LogContext): void {
    this.info('Image deletion successful', {
      ...context,
      operation: 'delete_success',
      url
    });
  }

  public deleteError(url: string, error: Error, context?: LogContext): void {
    this.error('Image deletion failed', {
      ...context,
      operation: 'delete_error',
      url
    }, error);
  }

  public storageConfigError(missingVars: string[]): void {
    this.error('Supabase storage configuration error', {
      operation: 'config_validation',
      missingVariables: missingVars
    });
  }

  public storageAccessError(bucket: string, error: Error): void {
    this.error('Storage bucket access validation failed', {
      operation: 'storage_access_validation',
      bucket
    }, error);
  }

  // Extract request context for logging
  public static extractRequestContext(req: Request): LogContext {
    return {
      requestId: req.headers['x-request-id'] as string || 'unknown',
      userId: (req as any).user?.id || 'anonymous',
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress
    };
  }
}

// Export singleton instance
export const logger = Logger.getInstance();