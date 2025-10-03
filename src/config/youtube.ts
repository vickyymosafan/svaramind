import { getAPIEnvironmentConfig } from './environment';

// Fallback API key as specified in requirements
const FALLBACK_YOUTUBE_API_KEY = 'AIzaSyB-6C-9pKRZja0W4wZhRInwtEZ71sLIQSw';

// Get YouTube API key with fallback
function getYouTubeAPIKey(): string {
  try {
    const envConfig = getAPIEnvironmentConfig();
    return envConfig.youtubeApiKey;
  } catch (error) {
    console.warn('Failed to get environment config, using fallback API key:', error);
    return FALLBACK_YOUTUBE_API_KEY;
  }
}

// YouTube API Configuration
export const YOUTUBE_API_KEY = getYouTubeAPIKey();

export const YOUTUBE_API_CONFIG = {
  baseURL: 'https://www.googleapis.com/youtube/v3',
  apiKey: YOUTUBE_API_KEY,
  endpoints: {
    videos: '/videos',
    search: '/search'
  },
  defaultParams: {
    part: 'snippet,statistics',
    chart: 'mostPopular',
    videoCategoryId: '10', // Music category
    maxResults: 12,
    safeSearch: 'moderate' as const,
    key: YOUTUBE_API_KEY
  }
};

// Region code mapping based on language
export function getRegionCode(language: string): string {
  const regionMap: Record<string, string> = {
    'id': 'ID',
    'en': 'US',
    'default': 'US'
  };
  return regionMap[language] || regionMap.default;
}

/**
 * Get YouTube API configuration with runtime validation
 * This ensures the API key is always validated when accessed
 */
export function getYouTubeConfig() {
  const apiKey = getYouTubeAPIKey();
  
  return {
    ...YOUTUBE_API_CONFIG,
    apiKey,
    defaultParams: {
      ...YOUTUBE_API_CONFIG.defaultParams,
      key: apiKey
    }
  };
}