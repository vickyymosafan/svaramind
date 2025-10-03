import { NextRequest, NextResponse } from 'next/server';
import { MoodService } from '@/services/moodService';
import { youtubeService } from '@/services/youtubeService';
import { transformYouTubeResponse, handleInvalidAPIData } from '@/utils/youtubeTransform';
import { MusicAPIRequest, MusicAPIResponse } from '@/types';
import { 
  handleAPIError, 
  validateMusicAPIRequest, 
  logError,
  APIErrorClass,
  ErrorType,
  createErrorNextResponse
} from '@/utils/errorHandler';
import { logger, createRequestId, measureTimeAsync } from '@/utils/logger';

/**
 * POST /api/music
 * Handles mood-based music discovery requests with comprehensive error handling and logging
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = createRequestId();
  const startTime = Date.now();
  
  // Log request start
  logger.logRequestStart('POST', '/api/music', requestId, {
    userAgent: request.headers.get('user-agent'),
    contentType: request.headers.get('content-type')
  });
  
  try {
    // Parse request body with error handling and timing
    const { result: body, time: parseTime } = await measureTimeAsync(async () => {
      return await parseRequestBody(request);
    });
    
    logger.debug('Request parsing', 'Request body parsed successfully', {
      requestId,
      parseTime: `${parseTime}ms`,
      bodySize: JSON.stringify(body).length
    });
    
    // Validate request with comprehensive validation
    const validationError = validateMusicAPIRequest(body);
    if (validationError) {
      logger.error('Request validation', 'Validation failed', validationError, {
        requestId,
        inputMood: body?.mood?.substring(0, 50) + '...' // Log first 50 chars only
      });
      
      const processingTime = Date.now() - startTime;
      logger.logRequestError('POST', '/api/music', requestId, validationError, 400, processingTime);
      
      return createErrorNextResponse(validationError.type, validationError.message);
    }

    const { mood, language = 'en' } = body;

    // Perform mood analysis with error handling and timing
    const { result: moodAnalysis, time: moodAnalysisTime } = await measureTimeAsync(async () => {
      try {
        const analysis = await MoodService.classifyMood(mood, {
          includeDebugInfo: false,
          minConfidence: 0.1
        });
        
        logger.logMoodAnalysis(requestId, mood, analysis, moodAnalysisTime);
        return analysis;
      } catch (error) {
        logger.error('Mood analysis', 'Mood classification failed', error as Error, {
          requestId,
          moodLength: mood.length,
          language
        });
        throw new APIErrorClass(
          ErrorType.SERVER_ERROR,
          'Unable to analyze your mood. Please try again.',
          { originalError: error }
        );
      }
    });

    // Check if mood analysis is reliable
    if (!MoodService.isReliableClassification(moodAnalysis)) {
      logger.warn('Mood reliability', 'Low confidence mood classification', {
        requestId,
        confidence: moodAnalysis.confidence,
        category: moodAnalysis.category
      });
    }

    // Fetch music based on mood with error handling and timing
    const { result: youtubeResponse, time: youtubeAPITime } = await measureTimeAsync(async () => {
      try {
        const response = await youtubeService.fetchMoodBasedMusic(
          moodAnalysis.keywords,
          language
        );
        
        logger.logYouTubeAPICall(
          requestId,
          moodAnalysis.keywords,
          language,
          response?.items?.length || 0,
          youtubeAPITime
        );
        
        return response;
      } catch (error) {
        logger.error('YouTube API', 'API call failed', error as Error, {
          requestId,
          keywords: moodAnalysis.keywords,
          language
        });
        throw new APIErrorClass(
          ErrorType.API_ERROR,
          'Unable to fetch music data. Please try again later.',
          { originalError: error }
        );
      }
    });

    // Transform and validate YouTube data with timing
    const { result: dataValidation, time: validationTime } = await measureTimeAsync(async () => {
      return handleInvalidAPIData(youtubeResponse);
    });
    
    logger.logDataValidation(
      requestId,
      dataValidation.isValid,
      dataValidation.errors,
      dataValidation.cleanedData.length,
      youtubeResponse?.items?.length || 0
    );
    
    if (!dataValidation.isValid) {
      throw new APIErrorClass(
        ErrorType.API_ERROR,
        'No valid music found for your mood. Please try a different description.',
        { validationErrors: dataValidation.errors }
      );
    }

    // Log performance metrics
    const processingTime = Date.now() - startTime;
    logger.logPerformanceMetrics(requestId, {
      totalTime: processingTime,
      moodAnalysisTime,
      youtubeAPITime,
      dataValidationTime: validationTime
    });

    // Log successful completion
    logger.logRequestComplete('POST', '/api/music', requestId, 200, processingTime, {
      resultCount: dataValidation.cleanedData.length,
      moodCategory: moodAnalysis.category,
      confidence: moodAnalysis.confidence
    });

    // Create successful response
    const response: MusicAPIResponse = {
      success: true,
      data: dataValidation.cleanedData,
      mood_analysis: {
        sentiment: moodAnalysis.category,
        score: Math.round(moodAnalysis.confidence * 100) / 100,
        keywords: moodAnalysis.keywords
      }
    };

    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'X-Request-ID': requestId,
        'X-Processing-Time': `${processingTime}ms`,
        'X-Result-Count': dataValidation.cleanedData.length.toString()
      }
    });

  } catch (error) {
    // Comprehensive error handling with context
    const processingTime = Date.now() - startTime;
    
    if (error instanceof APIErrorClass) {
      logger.logRequestError('POST', '/api/music', requestId, error, error.statusCode, processingTime);
    } else {
      logger.logRequestError('POST', '/api/music', requestId, error as Error, 500, processingTime);
    }
    
    return handleAPIError(error, 'POST /api/music', { 
      requestId, 
      processingTime: `${processingTime}ms`
    });
  }
}

/**
 * Parse request body with comprehensive error handling
 */
async function parseRequestBody(request: NextRequest): Promise<any> {
  try {
    const body = await request.json();
    return body;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new APIErrorClass(
        ErrorType.VALIDATION_ERROR,
        'Invalid JSON format in request body'
      );
    }
    throw new APIErrorClass(
      ErrorType.VALIDATION_ERROR,
      'Unable to parse request body'
    );
  }
}



/**
 * Handle unsupported HTTP methods with proper error responses and logging
 */
export async function GET(): Promise<NextResponse> {
  const requestId = createRequestId();
  logger.warn('Unsupported method', 'GET method attempted on /api/music', {
    requestId,
    method: 'GET',
    expectedMethod: 'POST'
  });
  
  return createErrorNextResponse(
    ErrorType.VALIDATION_ERROR,
    'Method GET not allowed. Use POST to submit mood data.'
  );
}

export async function PUT(): Promise<NextResponse> {
  const requestId = createRequestId();
  logger.warn('Unsupported method', 'PUT method attempted on /api/music', {
    requestId,
    method: 'PUT',
    expectedMethod: 'POST'
  });
  
  return createErrorNextResponse(
    ErrorType.VALIDATION_ERROR,
    'Method PUT not allowed. Use POST to submit mood data.'
  );
}

export async function DELETE(): Promise<NextResponse> {
  const requestId = createRequestId();
  logger.warn('Unsupported method', 'DELETE method attempted on /api/music', {
    requestId,
    method: 'DELETE',
    expectedMethod: 'POST'
  });
  
  return createErrorNextResponse(
    ErrorType.VALIDATION_ERROR,
    'Method DELETE not allowed. Use POST to submit mood data.'
  );
}

export async function PATCH(): Promise<NextResponse> {
  const requestId = createRequestId();
  logger.warn('Unsupported method', 'PATCH method attempted on /api/music', {
    requestId,
    method: 'PATCH',
    expectedMethod: 'POST'
  });
  
  return createErrorNextResponse(
    ErrorType.VALIDATION_ERROR,
    'Method PATCH not allowed. Use POST to submit mood data.'
  );
}