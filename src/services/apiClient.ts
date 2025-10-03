import { MusicAPIRequest, MusicAPIResponse } from '../types';

/**
 * API Client for Music Discovery
 * Handles communication with the /api/music endpoint
 */

// Configuration constants
const API_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string, 
  options: RequestInit, 
  timeout: number = API_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new APIError('Request timeout', 'TIMEOUT_ERROR');
    }
    throw error;
  }
}

/**
 * Main API client function to discover music based on mood
 * Implements retry logic and comprehensive error handling
 */
export async function discoverMusic(
  mood: string,
  language: 'id' | 'en' = 'id'
): Promise<MusicAPIResponse> {
  // Input validation
  if (!mood || mood.trim().length < 3) {
    throw new APIError(
      'Mood description must be at least 3 characters long',
      'VALIDATION_ERROR'
    );
  }

  const requestBody: MusicAPIRequest = {
    mood: mood.trim(),
    language
  };

  let lastError: Error | null = null;

  // Retry logic
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout('/api/music', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Don't retry for client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          throw new APIError(
            errorData.error || `Client error: ${response.status}`,
            'CLIENT_ERROR',
            response.status,
            errorData
          );
        }

        // Retry for server errors (5xx)
        throw new APIError(
          errorData.error || `Server error: ${response.status}`,
          'SERVER_ERROR',
          response.status,
          errorData
        );
      }

      // Parse successful response
      const data: MusicAPIResponse = await response.json();
      
      // Validate response structure
      if (typeof data.success !== 'boolean') {
        throw new APIError(
          'Invalid response format from server',
          'INVALID_RESPONSE'
        );
      }

      return data;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry for validation errors or client errors
      if (error instanceof APIError && 
          (error.code === 'VALIDATION_ERROR' || error.code === 'CLIENT_ERROR')) {
        throw error;
      }

      // Log retry attempt
      console.warn(`API call attempt ${attempt} failed:`, lastError.message);

      // If this was the last attempt, throw the error
      if (attempt === MAX_RETRIES) {
        break;
      }

      // Wait before retrying
      await sleep(RETRY_DELAY * attempt);
    }
  }

  // If we get here, all retries failed
  throw new APIError(
    `Failed to fetch music after ${MAX_RETRIES} attempts: ${lastError?.message}`,
    'NETWORK_ERROR',
    undefined,
    { originalError: lastError }
  );
}

/**
 * Utility function to check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof APIError) {
    return !['VALIDATION_ERROR', 'CLIENT_ERROR'].includes(error.code);
  }
  return true;
}

/**
 * Utility function to get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof APIError) {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        return error.message;
      case 'TIMEOUT_ERROR':
        return 'Request timed out. Please check your connection and try again.';
      case 'NETWORK_ERROR':
        return 'Network error occurred. Please check your connection and try again.';
      case 'CLIENT_ERROR':
        return 'Invalid request. Please try again with different input.';
      case 'SERVER_ERROR':
        return 'Server error occurred. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred. Please try again.';
}