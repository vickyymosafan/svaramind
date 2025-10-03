import { YouTubeAPIResponse, YouTubeVideoItem, YouTubeVideo } from '../types';

/**
 * Transform YouTube API response to internal data model
 * @param apiResponse - Raw YouTube API response
 * @returns Array of transformed YouTubeVideo objects
 */
export function transformYouTubeResponse(apiResponse: YouTubeAPIResponse): YouTubeVideo[] {
  if (!apiResponse || !apiResponse.items || !Array.isArray(apiResponse.items)) {
    console.warn('Invalid YouTube API response structure');
    return [];
  }

  return apiResponse.items
    .map(transformVideoItem)
    .filter((video): video is YouTubeVideo => video !== null);
}

/**
 * Transform a single YouTube video item to internal format
 * @param item - YouTube API video item
 * @returns Transformed YouTubeVideo or null if invalid
 */
export function transformVideoItem(item: YouTubeVideoItem): YouTubeVideo | null {
  try {
    // Validate required fields
    if (!item || !item.snippet || !item.id) {
      console.warn('Missing required fields in YouTube video item');
      return null;
    }

    const { snippet, statistics } = item;

    // Extract and validate thumbnail
    const thumbnail = extractThumbnail(snippet.thumbnails);
    if (!thumbnail) {
      console.warn('No valid thumbnail found for video:', snippet.title);
      return null;
    }

    // Transform to internal model
    const transformedVideo: YouTubeVideo = {
      id: sanitizeString(item.id) || '',
      title: sanitizeString(snippet.title) || 'Untitled',
      channelTitle: sanitizeString(snippet.channelTitle) || 'Unknown Channel',
      thumbnail,
      publishedAt: sanitizeString(snippet.publishedAt) || new Date().toISOString(),
      viewCount: sanitizeString(statistics?.viewCount) || '0',
      likeCount: sanitizeString(statistics?.likeCount) || '0'
    };

    return transformedVideo;
  } catch (error) {
    console.error('Error transforming YouTube video item:', error);
    return null;
  }
}

/**
 * Extract the best available thumbnail URL
 * @param thumbnails - YouTube thumbnails object
 * @returns Best thumbnail URL or null
 */
function extractThumbnail(thumbnails: any): string | null {
  if (!thumbnails || typeof thumbnails !== 'object') {
    return null;
  }

  // Priority order: high -> medium -> default
  const priorities = ['high', 'medium', 'default'];
  
  for (const priority of priorities) {
    const thumbnail = thumbnails[priority];
    if (thumbnail && thumbnail.url && isValidUrl(thumbnail.url)) {
      return thumbnail.url;
    }
  }

  return null;
}

/**
 * Sanitize string values from API response
 * @param value - Raw value from API
 * @returns Sanitized string or null
 */
function sanitizeString(value: any): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  // Remove potentially harmful characters and trim
  const sanitized = value
    .replace(/[<>]/g, '') // Remove basic HTML tags
    .trim();

  return sanitized.length > 0 ? sanitized : null;
}

/**
 * Validate if a string is a valid URL
 * @param url - URL string to validate
 * @returns boolean indicating if URL is valid
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
}

/**
 * Format view count for display
 * @param viewCount - Raw view count string
 * @returns Formatted view count string
 */
export function formatViewCount(viewCount: string): string {
  const count = parseInt(viewCount, 10);
  
  if (isNaN(count)) {
    return '0 views';
  }

  if (count >= 1000000000) {
    return `${(count / 1000000000).toFixed(1)}B views`;
  } else if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M views`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K views`;
  } else {
    return `${count} views`;
  }
}

/**
 * Format like count for display
 * @param likeCount - Raw like count string
 * @returns Formatted like count string
 */
export function formatLikeCount(likeCount: string): string {
  const count = parseInt(likeCount, 10);
  
  if (isNaN(count)) {
    return '0 likes';
  }

  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M likes`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K likes`;
  } else {
    return `${count} likes`;
  }
}

/**
 * Format published date for display
 * @param publishedAt - ISO date string
 * @returns Formatted date string
 */
export function formatPublishedDate(publishedAt: string): string {
  try {
    const date = new Date(publishedAt);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Unknown date';
  }
}

/**
 * Validate transformed video data
 * @param video - Transformed video object
 * @returns boolean indicating if video is valid
 */
export function validateTransformedVideo(video: YouTubeVideo): boolean {
  const requiredFields = ['id', 'title', 'channelTitle', 'thumbnail'];
  
  for (const field of requiredFields) {
    if (!video[field as keyof YouTubeVideo] || 
        typeof video[field as keyof YouTubeVideo] !== 'string' ||
        (video[field as keyof YouTubeVideo] as string).trim() === '') {
      console.warn(`Invalid or missing field: ${field}`);
      return false;
    }
  }

  // Validate thumbnail URL
  if (!isValidUrl(video.thumbnail)) {
    console.warn('Invalid thumbnail URL:', video.thumbnail);
    return false;
  }

  return true;
}

/**
 * Handle missing or invalid data from API response
 * @param apiResponse - Raw YouTube API response
 * @returns Object with validation results and cleaned data
 */
export function handleInvalidAPIData(apiResponse: any): {
  isValid: boolean;
  errors: string[];
  cleanedData: YouTubeVideo[];
} {
  const errors: string[] = [];
  let cleanedData: YouTubeVideo[] = [];

  // Check if response exists
  if (!apiResponse) {
    errors.push('API response is null or undefined');
    return { isValid: false, errors, cleanedData };
  }

  // Check if items array exists
  if (!apiResponse.items || !Array.isArray(apiResponse.items)) {
    errors.push('API response missing items array');
    return { isValid: false, errors, cleanedData };
  }

  // Check if items array is empty
  if (apiResponse.items.length === 0) {
    errors.push('No videos found in API response');
    return { isValid: false, errors, cleanedData };
  }

  // Transform and validate each item
  const transformedVideos = transformYouTubeResponse(apiResponse);
  const validVideos = transformedVideos.filter(validateTransformedVideo);

  if (validVideos.length === 0) {
    errors.push('No valid videos after transformation and validation');
    return { isValid: false, errors, cleanedData };
  }

  // Report any videos that were filtered out
  const filteredCount = transformedVideos.length - validVideos.length;
  if (filteredCount > 0) {
    errors.push(`${filteredCount} videos were filtered out due to invalid data`);
  }

  cleanedData = validVideos;
  return { 
    isValid: true, 
    errors, 
    cleanedData 
  };
}