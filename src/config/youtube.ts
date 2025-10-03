// YouTube API Configuration
export const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyB-6C-9pKRZja0W4wZhRInwtEZ71sLIQSw';

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

// Environment validation
const requiredEnvVars = {
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
};

export function validateEnvironment(): void {
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      console.warn(`Missing environment variable: ${key}, using fallback value`);
    }
  }
}