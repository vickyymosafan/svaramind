// YouTube API Data Models
export interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: string;
  likeCount: string;
}

export interface YouTubeAPIResponse {
  kind: string;
  etag: string;
  items: YouTubeVideoItem[];
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export interface YouTubeVideoItem {
  kind: string;
  etag: string;
  id: string | { kind: string; videoId: string; };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default?: { url: string; width: number; height: number; };
      medium?: { url: string; width: number; height: number; };
      high?: { url: string; width: number; height: number; };
    };
    channelTitle: string;
    categoryId?: string;
    liveBroadcastContent?: string;
  };
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    dislikeCount?: string;
    favoriteCount?: string;
    commentCount?: string;
  };
}

// Sentiment Analysis Models
export interface SentimentResult {
  score: number;        // -5 to 5 range
  comparative: number;  // normalized score
  calculation: any[];   // Flexible type for sentiment library calculation
  tokens: string[];
  words: string[];
  positive: string[];
  negative: string[];
}

export interface MoodClassification {
  category: 'positive' | 'negative' | 'neutral';
  confidence: number;
  keywords: string;
}

// API Request/Response Models
export interface MusicAPIRequest {
  mood: string;
  language?: 'id' | 'en';
}

export interface MusicAPIResponse {
  success: boolean;
  data?: YouTubeVideo[];
  error?: string;
  mood_analysis?: {
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
    keywords: string;
  };
}

export interface APIError {
  success: false;
  error: string;
  code: 'VALIDATION_ERROR' | 'API_ERROR' | 'SERVER_ERROR';
  details?: any;
}

// Component Props Interfaces
export interface HeroSectionProps {
  onMoodSubmit: (mood: string) => void;
  isLoading: boolean;
}

export interface MoodFormProps {
  onSubmit: (mood: string) => void;
  isLoading: boolean;
}

export interface MusicGridProps {
  videos: YouTubeVideo[];
  isLoading: boolean;
  error?: string;
}

export interface MusicCardProps {
  video: YouTubeVideo;
}