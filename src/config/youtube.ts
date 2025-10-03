import { getAPIEnvironmentConfig } from './environment';

// Get validated environment configuration
const envConfig = getAPIEnvironmentConfig();

// YouTube API Configuration with validated environment
export const YOUTUBE_API_KEY = envConfig.youtubeApiKey;

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
  const config = getAPIEnvironmentConfig();
  
  return {
    ...YOUTUBE_API_CONFIG,
    apiKey: config.youtubeApiKey,
    defaultParams: {
      ...YOUTUBE_API_CONFIG.defaultParams,
      key: config.youtubeApiKey
    }
  };
}