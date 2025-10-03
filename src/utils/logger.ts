/**
 * Comprehensive logging utility for the music discovery API
 * Provides structured logging with different levels and contexts
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  requestId?: string;
  userId?: string;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Logger class for structured logging
 */
export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Set minimum log level
   */
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Check if log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  /**
   * Create structured log entry
   */
  private createLogEntry(
    level: LogLevel,
    context: string,
    message: string,
    metadata?: Record<string, any>,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      ...(metadata && { metadata }),
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      })
    };

    return entry;
  }

  /**
   * Output log entry to console
   */
  private outputLog(entry: LogEntry): void {
    const logMessage = `[${entry.timestamp}] ${entry.level} - ${entry.context}: ${entry.message}`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, entry.metadata || {});
        break;
      case LogLevel.INFO:
        console.info(logMessage, entry.metadata || {});
        break;
      case LogLevel.WARN:
        console.warn(logMessage, entry.metadata || {});
        break;
      case LogLevel.ERROR:
        console.error(logMessage, entry.metadata || {}, entry.error || {});
        break;
    }
  }

  /**
   * Debug level logging
   */
  public debug(context: string, message: string, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const entry = this.createLogEntry(LogLevel.DEBUG, context, message, metadata);
    this.outputLog(entry);
  }

  /**
   * Info level logging
   */
  public info(context: string, message: string, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const entry = this.createLogEntry(LogLevel.INFO, context, message, metadata);
    this.outputLog(entry);
  }

  /**
   * Warning level logging
   */
  public warn(context: string, message: string, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const entry = this.createLogEntry(LogLevel.WARN, context, message, metadata);
    this.outputLog(entry);
  }

  /**
   * Error level logging
   */
  public error(context: string, message: string, error?: Error, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const entry = this.createLogEntry(LogLevel.ERROR, context, message, metadata, error);
    this.outputLog(entry);
  }

  /**
   * Log API request start
   */
  public logRequestStart(
    method: string,
    path: string,
    requestId: string,
    metadata?: Record<string, any>
  ): void {
    this.info(
      `${method} ${path}`,
      'Request started',
      { requestId, ...metadata }
    );
  }

  /**
   * Log API request completion
   */
  public logRequestComplete(
    method: string,
    path: string,
    requestId: string,
    statusCode: number,
    processingTime: number,
    metadata?: Record<string, any>
  ): void {
    this.info(
      `${method} ${path}`,
      'Request completed',
      { 
        requestId, 
        statusCode, 
        processingTime: `${processingTime}ms`,
        ...metadata 
      }
    );
  }

  /**
   * Log API request error
   */
  public logRequestError(
    method: string,
    path: string,
    requestId: string,
    error: Error,
    statusCode: number,
    processingTime: number,
    metadata?: Record<string, any>
  ): void {
    this.error(
      `${method} ${path}`,
      'Request failed',
      error,
      { 
        requestId, 
        statusCode, 
        processingTime: `${processingTime}ms`,
        ...metadata 
      }
    );
  }

  /**
   * Log mood analysis
   */
  public logMoodAnalysis(
    requestId: string,
    mood: string,
    result: {
      category: string;
      confidence: number;
      keywords: string;
    },
    processingTime?: number
  ): void {
    this.info(
      'Mood Analysis',
      'Mood classification completed',
      {
        requestId,
        inputLength: mood.length,
        category: result.category,
        confidence: result.confidence,
        keywords: result.keywords,
        ...(processingTime && { processingTime: `${processingTime}ms` })
      }
    );
  }

  /**
   * Log YouTube API call
   */
  public logYouTubeAPICall(
    requestId: string,
    keywords: string,
    language: string,
    resultCount: number,
    processingTime?: number
  ): void {
    this.info(
      'YouTube API',
      'API call completed',
      {
        requestId,
        keywords,
        language,
        resultCount,
        ...(processingTime && { processingTime: `${processingTime}ms` })
      }
    );
  }

  /**
   * Log data validation
   */
  public logDataValidation(
    requestId: string,
    isValid: boolean,
    errors?: string[],
    validCount?: number,
    totalCount?: number
  ): void {
    if (isValid) {
      this.info(
        'Data Validation',
        'Data validation passed',
        {
          requestId,
          validCount,
          totalCount
        }
      );
    } else {
      this.warn(
        'Data Validation',
        'Data validation failed',
        {
          requestId,
          errors,
          validCount,
          totalCount
        }
      );
    }
  }

  /**
   * Log performance metrics
   */
  public logPerformanceMetrics(
    requestId: string,
    metrics: {
      totalTime: number;
      moodAnalysisTime?: number;
      youtubeAPITime?: number;
      dataValidationTime?: number;
    }
  ): void {
    this.info(
      'Performance',
      'Request performance metrics',
      {
        requestId,
        ...metrics,
        totalTime: `${metrics.totalTime}ms`,
        ...(metrics.moodAnalysisTime && { 
          moodAnalysisTime: `${metrics.moodAnalysisTime}ms` 
        }),
        ...(metrics.youtubeAPITime && { 
          youtubeAPITime: `${metrics.youtubeAPITime}ms` 
        }),
        ...(metrics.dataValidationTime && { 
          dataValidationTime: `${metrics.dataValidationTime}ms` 
        })
      }
    );
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Set log level based on environment
if (process.env.NODE_ENV === 'development') {
  logger.setLogLevel(LogLevel.DEBUG);
} else if (process.env.NODE_ENV === 'production') {
  logger.setLogLevel(LogLevel.WARN);
} else {
  logger.setLogLevel(LogLevel.INFO);
}

// Export utility functions
export function createRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function measureTime<T>(fn: () => T): { result: T; time: number } {
  const start = Date.now();
  const result = fn();
  const time = Date.now() - start;
  return { result, time };
}

export async function measureTimeAsync<T>(fn: () => Promise<T>): Promise<{ result: T; time: number }> {
  const start = Date.now();
  const result = await fn();
  const time = Date.now() - start;
  return { result, time };
}