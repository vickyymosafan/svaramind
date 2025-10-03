// Mood classification constants
export const MOOD_KEYWORDS = {
  positive: 'upbeat viral song happy energetic',
  negative: 'sad viral song melancholic emotional',
  neutral: 'lofi viral music chill relaxing'
} as const;

// Sentiment analysis thresholds
export const SENTIMENT_THRESHOLDS = {
  positive: { score: 1, comparative: 0.1 },
  negative: { score: -1, comparative: -0.1 }
} as const;

// API configuration constants
export const API_CONSTANTS = {
  MAX_RESULTS: 12,
  MUSIC_CATEGORY_ID: '10',
  DEFAULT_REGION: 'US',
  REQUEST_TIMEOUT: 10000 // 10 seconds
} as const;