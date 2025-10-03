import { NextResponse } from 'next/server';
import { APIError } from '@/types';

/**
 * Error types for the music discovery API
 */
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  API_ERROR = 'API_ERROR', 
  SERVER_ERROR = 'SERVER_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

/**
 * HTTP status codes mapping for different error types
 */
export const ERROR_STATUS_CODES = {
  [ErrorType.VALIDATION_ERROR]: 400,
  [ErrorType.API_ERROR]: 503,
  [ErrorType.SERVER_ERROR]: 500,
  [ErrorType.RATE_LIMIT_ERROR]: 429,
  [ErrorType.AUTHENTICATION_ERROR]: 401,
  [ErrorType.NETWORK_ERROR]: 502
} as const;

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES = {
  [ErrorType.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorType.API_ERROR]: 'Unable to fetch music data. Please try again later.',
  [ErrorType.SERVER_ERROR]: 'An unexpected error occurred. Please try again.',
  [ErrorType.RATE_LIMIT_ERROR]: 'Too many requests. Please wait a moment and try again.',
  [ErrorType.AUTHENTICATION_ERROR]: 'Service authentication failed. Please contact support.',
  [ErrorType.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection.'
} as const;

/**
 * Custom error class for API errors
 */
export class APIErrorClass extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly details?: any;
  public readonly timestamp: string;

  constructor(
    type: ErrorType,
    message?: string,
    details?: any
  ) {
    super(message || ERROR_MESSAGES[type]);
    this.name = 'APIError';
    this.type = type;
    this.statusCode = ERROR_STATUS_CODES[type];
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  type: ErrorType,
  message?: string,
  details?: any
): APIError {
  return {
    success: false,
    error: message || ERROR_MESSAGES[type],
    code: type,
    ...(details && { details })
  };
}

/**
 * Create NextResponse with proper error formatting
 */
export function createErrorNextResponse(
  type: ErrorType,
  message?: string,
  details?: any
): NextResponse {
  const errorResponse = createErrorResponse(type, message, details);
  const statusCode = ERROR_STATUS_CODES[type];
  
  return NextResponse.json(errorResponse, { status: statusCode });
}

/**
 * Log error with appropriate level and context
 */
export function logError(
  error: Error | APIErrorClass | unknown,
  context: string,
  additionalInfo?: Record<string, any>
): void {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    context,
    ...additionalInfo
  };

  if (error instanceof APIErrorClass) {
    // Structured logging for API errors
    console.error(`[${timestamp}] API Error in ${context}:`, {
      ...logData,
      type: error.type,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details
    });
  } else if (error instanceof Error) {
    // Standard error logging
    console.error(`[${timestamp}] Error in ${context}:`, {
      ...logData,
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  } else {
    // Unknown error type
    console.error(`[${timestamp}] Unknown error in ${context}:`, {
      ...logData,
      error: String(error)
    });
  }
}

/**
 * Parse and classify YouTube API errors
 */
export function parseYouTubeAPIError(error: any): APIErrorClass {
  if (!error) {
    return new APIErrorClass(ErrorType.SERVER_ERROR, 'Unknown YouTube API error');
  }

  const errorMessage = error.message || String(error);
  
  // Check for specific YouTube API error patterns
  if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
    return new APIErrorClass(
      ErrorType.AUTHENTICATION_ERROR,
      'YouTube API access denied. Please check API configuration.',
      { originalError: errorMessage }
    );
  }
  
  if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
    return new APIErrorClass(
      ErrorType.RATE_LIMIT_ERROR,
      'YouTube API rate limit exceeded. Please try again later.',
      { originalError: errorMessage }
    );
  }
  
  if (errorMessage.includes('404') || errorMessage.includes('not found')) {
    return new APIErrorClass(
      ErrorType.API_ERROR,
      'No music found for your mood. Please try a different description.',
      { originalError: errorMessage }
    );
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return new APIErrorClass(
      ErrorType.NETWORK_ERROR,
      'Unable to connect to YouTube API. Please check your internet connection.',
      { originalError: errorMessage }
    );
  }
  
  if (errorMessage.includes('timeout')) {
    return new APIErrorClass(
      ErrorType.API_ERROR,
      'Request timed out. Please try again.',
      { originalError: errorMessage }
    );
  }

  // Generic API error
  return new APIErrorClass(
    ErrorType.API_ERROR,
    'Unable to fetch music data. Please try again later.',
    { originalError: errorMessage }
  );
}

/**
 * Parse and classify sentiment analysis errors
 */
export function parseSentimentAnalysisError(error: any): APIErrorClass {
  if (!error) {
    return new APIErrorClass(ErrorType.SERVER_ERROR, 'Unknown sentiment analysis error');
  }

  const errorMessage = error.message || String(error);
  
  if (errorMessage.includes('validation') || errorMessage.includes('invalid input')) {
    return new APIErrorClass(
      ErrorType.VALIDATION_ERROR,
      'Invalid mood description. Please provide a meaningful description of your mood.',
      { originalError: errorMessage }
    );
  }
  
  if (errorMessage.includes('library') || errorMessage.includes('sentiment')) {
    return new APIErrorClass(
      ErrorType.SERVER_ERROR,
      'Mood analysis service temporarily unavailable. Please try again.',
      { originalError: errorMessage }
    );
  }

  // Generic sentiment analysis error
  return new APIErrorClass(
    ErrorType.SERVER_ERROR,
    'Unable to analyze mood. Please try again.',
    { originalError: errorMessage }
  );
}

/**
 * Validate request and return appropriate error if invalid
 */
export function validateMusicAPIRequest(body: any): APIErrorClass | null {
  if (!body || typeof body !== 'object') {
    return new APIErrorClass(
      ErrorType.VALIDATION_ERROR,
      'Request body must be a valid JSON object'
    );
  }

  if (!body.mood || typeof body.mood !== 'string') {
    return new APIErrorClass(
      ErrorType.VALIDATION_ERROR,
      'Mood field is required and must be a string'
    );
  }

  const trimmedMood = body.mood.trim();
  if (trimmedMood.length < 3) {
    return new APIErrorClass(
      ErrorType.VALIDATION_ERROR,
      'Mood description must be at least 3 characters long'
    );
  }

  if (trimmedMood.length > 500) {
    return new APIErrorClass(
      ErrorType.VALIDATION_ERROR,
      'Mood description must be less than 500 characters'
    );
  }

  // Validate language if provided
  if (body.language && !['id', 'en'].includes(body.language)) {
    return new APIErrorClass(
      ErrorType.VALIDATION_ERROR,
      'Language must be either "id" or "en"'
    );
  }

  return null; // No validation errors
}

/**
 * Handle and format any error for API response
 */
export function handleAPIError(
  error: unknown,
  context: string,
  additionalInfo?: Record<string, any>
): NextResponse {
  // Log the error for debugging
  logError(error, context, additionalInfo);

  // Handle different error types
  if (error instanceof APIErrorClass) {
    return createErrorNextResponse(error.type, error.message, error.details);
  }

  if (error instanceof Error) {
    // Try to classify the error based on message
    if (error.message.includes('YouTube')) {
      const youtubeError = parseYouTubeAPIError(error);
      return createErrorNextResponse(youtubeError.type, youtubeError.message, youtubeError.details);
    }
    
    if (error.message.includes('sentiment') || error.message.includes('mood')) {
      const sentimentError = parseSentimentAnalysisError(error);
      return createErrorNextResponse(sentimentError.type, sentimentError.message, sentimentError.details);
    }
    
    if (error.message.includes('validation')) {
      return createErrorNextResponse(ErrorType.VALIDATION_ERROR, error.message);
    }
  }

  // Fallback to generic server error
  return createErrorNextResponse(
    ErrorType.SERVER_ERROR,
    'An unexpected error occurred. Please try again.'
  );
}

/**
 * Middleware for handling unsupported HTTP methods
 */
export function handleUnsupportedMethod(method: string): NextResponse {
  return createErrorNextResponse(
    ErrorType.VALIDATION_ERROR,
    `Method ${method} not allowed. Use POST to submit mood data.`
  );
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: APIErrorClass | Error): boolean {
  if (error instanceof APIErrorClass) {
    return [
      ErrorType.NETWORK_ERROR,
      ErrorType.API_ERROR,
      ErrorType.RATE_LIMIT_ERROR
    ].includes(error.type);
  }
  
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('network') || 
           message.includes('timeout') || 
           message.includes('rate limit');
  }
  
  return false;
}

/**
 * Get retry delay based on error type
 */
export function getRetryDelay(error: APIErrorClass | Error): number {
  if (error instanceof APIErrorClass) {
    switch (error.type) {
      case ErrorType.RATE_LIMIT_ERROR:
        return 60000; // 1 minute
      case ErrorType.NETWORK_ERROR:
        return 5000;  // 5 seconds
      case ErrorType.API_ERROR:
        return 10000; // 10 seconds
      default:
        return 0;
    }
  }
  
  return 5000; // Default 5 seconds
}