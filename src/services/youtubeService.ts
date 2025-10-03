import { YOUTUBE_API_CONFIG, getRegionCode } from '../config/youtube';
import { YouTubeAPIResponse, YouTubeVideo } from '../types';

/**
 * YouTube API Service for fetching popular music videos
 */
export class YouTubeService {
  private readonly apiKey: string;
  private readonly baseURL: string;

  constructor() {
    this.apiKey = YOUTUBE_API_CONFIG.apiKey;
    this.baseURL = YOUTUBE_API_CONFIG.baseURL;
  }

  /**
   * Fetch popular music videos from YouTube
   * @param regionCode - Region code for localized results (e.g., 'ID', 'US')
   * @param searchQuery - Optional search query for specific mood-based music
   * @returns Promise<YouTubeAPIResponse>
   */
  async fetchPopularMusic(
    regionCode: string = 'US',
    searchQuery?: string
  ): Promise<YouTubeAPIResponse> {
    try {
      const url = this.buildAPIUrl(regionCode, searchQuery);
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }

      const data: YouTubeAPIResponse = await response.json();
      
      if (!data.items || data.items.length === 0) {
        throw new Error('No videos found for the specified criteria');
      }

      return data;
    } catch (error) {
      console.error('Error fetching YouTube data:', error);
      throw this.handleAPIError(error);
    }
  }

  /**
   * Fetch music videos based on mood keywords
   * @param moodKeywords - Keywords generated from mood analysis
   * @param language - Language preference for region targeting
   * @returns Promise<YouTubeAPIResponse>
   */
  async fetchMoodBasedMusic(
    moodKeywords: string,
    language: string = 'en'
  ): Promise<YouTubeAPIResponse> {
    const regionCode = getRegionCode(language);
    return this.fetchPopularMusic(regionCode, moodKeywords);
  }

  /**
   * Build the YouTube API URL with appropriate parameters
   * @private
   */
  private buildAPIUrl(regionCode: string, searchQuery?: string): URL {
    const endpoint = searchQuery 
      ? YOUTUBE_API_CONFIG.endpoints.search 
      : YOUTUBE_API_CONFIG.endpoints.videos;
    
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    // Base parameters - create a mutable copy
    const params: Record<string, string | number> = {
      ...YOUTUBE_API_CONFIG.defaultParams,
      regionCode,
      key: this.apiKey
    };

    // If we have a search query, modify parameters for search endpoint
    if (searchQuery) {
      params.q = searchQuery;
      params.type = 'video';
      params.order = 'relevance';
      // Remove chart parameter for search endpoint
      delete params.chart;
    }

    // Add all parameters to URL
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });

    return url;
  }

  /**
   * Handle and transform API errors into user-friendly messages
   * @private
   */
  private handleAPIError(error: any): Error {
    if (error instanceof Error) {
      // Network or fetch errors
      if (error.message.includes('fetch')) {
        return new Error('Unable to connect to YouTube API. Please check your internet connection.');
      }
      
      // API-specific errors
      if (error.message.includes('403')) {
        return new Error('YouTube API access denied. Please check your API key.');
      }
      
      if (error.message.includes('429')) {
        return new Error('YouTube API rate limit exceeded. Please try again later.');
      }
      
      if (error.message.includes('404')) {
        return new Error('YouTube API endpoint not found.');
      }
      
      return error;
    }
    
    return new Error('An unexpected error occurred while fetching music data.');
  }

  /**
   * Validate API configuration
   * @returns boolean indicating if configuration is valid
   */
  validateConfiguration(): boolean {
    if (!this.apiKey || this.apiKey === '') {
      console.error('YouTube API key is missing or empty');
      return false;
    }
    
    if (!this.baseURL || this.baseURL === '') {
      console.error('YouTube API base URL is missing or empty');
      return false;
    }
    
    return true;
  }
}

// Export singleton instance
export const youtubeService = new YouTubeService();

// Export utility functions
export { getRegionCode } from '../config/youtube';