import { NextResponse } from 'next/server';
import { validateEnvironment } from '@/config/environment';

/**
 * Health check endpoint for environment validation
 * GET /api/health
 */
export async function GET(): Promise<NextResponse> {
  try {
    const validation = validateEnvironment();
    
    return NextResponse.json({
      status: 'healthy',
      environment: validation.config.nodeEnv,
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings,
      timestamp: new Date().toISOString(),
      services: {
        youtubeApi: validation.config.youtubeApiKey ? 'configured' : 'missing'
      }
    }, { 
      status: validation.isValid ? 200 : 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}