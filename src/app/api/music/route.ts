import { NextRequest, NextResponse } from 'next/server';
import { MoodService } from '@/services/moodService';
import { youtubeService } from '@/services/youtubeService';
import { MusicAPIRequest, MusicAPIResponse } from '@/types';

/**
 * POST /api/music
 * Handles mood-based music discovery requests
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body = await request.json();
    
    // Basic validation
    if (!body || !body.mood || typeof body.mood !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Mood field is required and must be a string'
      }, { status: 400 });
    }

    const mood = body.mood.trim();
    if (mood.length < 3) {
      return NextResponse.json({
        success: false,
        error: 'Mood description must be at least 3 characters long'
      }, { status: 400 });
    }

    const language = body.language || 'en';

    console.log('Processing mood:', mood);

    // Perform mood analysis
    const moodAnalysis = await MoodService.classifyMood(mood, {
      includeDebugInfo: false,
      minConfidence: 0.1
    });

    console.log('Mood analysis result:', moodAnalysis);

    // Fetch music based on mood
    const youtubeResponse = await youtubeService.fetchMoodBasedMusic(
      moodAnalysis.keywords,
      language
    );

    console.log('YouTube response:', youtubeResponse?.items?.length || 0, 'items');

    // Transform YouTube data to our format
    const videos = youtubeResponse.items?.map(item => ({
      id: typeof item.id === 'string' ? item.id : item.id?.videoId || '',
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium?.url || 
                item.snippet.thumbnails.default?.url || 
                item.snippet.thumbnails.high?.url || 
                'https://via.placeholder.com/320x180?text=No+Thumbnail',
      publishedAt: item.snippet.publishedAt,
      viewCount: item.statistics?.viewCount || '0',
      likeCount: item.statistics?.likeCount || '0'
    })) || [];

    // Create successful response
    const response: MusicAPIResponse = {
      success: true,
      data: videos,
      mood_analysis: {
        sentiment: moodAnalysis.category,
        score: Math.round(moodAnalysis.confidence * 100) / 100,
        keywords: moodAnalysis.keywords
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error in /api/music:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Unable to analyze your mood. Please try again.'
    }, { status: 500 });
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Method GET not allowed. Use POST to submit mood data.'
  }, { status: 405 });
}