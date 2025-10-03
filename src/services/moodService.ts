import { MoodClassification } from '@/types';
import { 
  analyzeMoodWithFallback, 
  analyzeSentiment, 
  classifyMood, 
  validateMoodInput,
  generateKeywords 
} from '@/utils/sentiment';

/**
 * Service class for mood classification and analysis
 * Provides high-level interface for sentiment analysis operations
 */
export class MoodService {
  /**
   * Analyzes mood from text input with comprehensive error handling
   * @param moodText - The user's mood description
   * @param options - Optional configuration for analysis
   * @returns Promise<MoodClassification> with mood analysis results
   */
  static async classifyMood(
    moodText: string, 
    options: { 
      includeDebugInfo?: boolean;
      minConfidence?: number;
    } = {}
  ): Promise<MoodClassification & { debugInfo?: any }> {
    
    const { includeDebugInfo = false, minConfidence = 0.1 } = options;
    
    try {
      // Input validation
      if (!moodText || typeof moodText !== 'string') {
        throw new Error('Mood text must be a non-empty string');
      }

      const trimmedText = moodText.trim();
      if (!validateMoodInput(trimmedText)) {
        throw new Error('Mood text must be between 3 and 500 characters');
      }

      // Perform sentiment analysis with fallback (now async)
      const moodClassification = await analyzeMoodWithFallback(trimmedText);
      
      // Apply minimum confidence threshold
      if (moodClassification.confidence < minConfidence) {
        console.warn(`Low confidence score: ${moodClassification.confidence}, using neutral fallback`);
        return {
          category: 'neutral',
          confidence: minConfidence,
          keywords: generateKeywords('neutral'),
          ...(includeDebugInfo && { 
            debugInfo: { 
              originalClassification: moodClassification,
              reason: 'Low confidence threshold'
            }
          })
        };
      }

      // Add debug information if requested
      if (includeDebugInfo) {
        const sentimentResult = await analyzeSentiment(trimmedText);
        return {
          ...moodClassification,
          debugInfo: {
            sentimentAnalysis: sentimentResult,
            inputLength: trimmedText.length,
            processingTime: Date.now()
          }
        };
      }

      return moodClassification;

    } catch (error) {
      console.error('Error in MoodService.classifyMood:', error);
      
      // Return safe fallback
      return {
        category: 'neutral',
        confidence: 0.1,
        keywords: generateKeywords('neutral'),
        ...(includeDebugInfo && { 
          debugInfo: { 
            error: error instanceof Error ? error.message : 'Unknown error',
            fallbackUsed: true
          }
        })
      };
    }
  }

  /**
   * Batch processes multiple mood texts
   * @param moodTexts - Array of mood descriptions
   * @returns Promise<MoodClassification[]> with results for each input
   */
  static async classifyMultipleMoods(moodTexts: string[]): Promise<MoodClassification[]> {
    if (!Array.isArray(moodTexts) || moodTexts.length === 0) {
      throw new Error('Input must be a non-empty array of strings');
    }

    const results: MoodClassification[] = [];
    
    for (const moodText of moodTexts) {
      try {
        const classification = await this.classifyMood(moodText);
        results.push(classification);
      } catch (error) {
        console.error(`Error processing mood text: "${moodText}"`, error);
        // Add fallback result for failed classification
        results.push({
          category: 'neutral',
          confidence: 0.1,
          keywords: generateKeywords('neutral')
        });
      }
    }

    return results;
  }

  /**
   * Gets mood statistics from classification result
   * @param moodClassification - The mood classification result
   * @returns Object with mood statistics and insights
   */
  static getMoodInsights(moodClassification: MoodClassification): {
    category: string;
    confidence: number;
    confidenceLevel: 'low' | 'medium' | 'high';
    keywords: string[];
    recommendation: string;
  } {
    const { category, confidence, keywords } = moodClassification;
    
    // Determine confidence level
    let confidenceLevel: 'low' | 'medium' | 'high';
    if (confidence < 0.3) {
      confidenceLevel = 'low';
    } else if (confidence < 0.7) {
      confidenceLevel = 'medium';
    } else {
      confidenceLevel = 'high';
    }

    // Generate recommendation based on mood
    const recommendations = {
      positive: 'Great! We\'ll find you some upbeat and energetic songs to match your positive mood.',
      negative: 'We understand. Let\'s find some emotional songs that might resonate with how you\'re feeling.',
      neutral: 'Perfect for a chill session. We\'ll find you some relaxing lofi music to enjoy.'
    };

    return {
      category,
      confidence: Math.round(confidence * 100) / 100, // Round to 2 decimal places
      confidenceLevel,
      keywords: keywords.split(' ').filter(word => word.length > 0),
      recommendation: recommendations[category]
    };
  }

  /**
   * Validates if a mood classification result is reliable
   * @param moodClassification - The mood classification to validate
   * @returns boolean indicating if the result is reliable
   */
  static isReliableClassification(moodClassification: MoodClassification): boolean {
    const { confidence, category } = moodClassification;
    
    // Minimum confidence threshold
    if (confidence < 0.2) {
      return false;
    }

    // Check if category is valid
    if (!['positive', 'negative', 'neutral'].includes(category)) {
      return false;
    }

    // Check if keywords are present
    if (!moodClassification.keywords || moodClassification.keywords.trim().length === 0) {
      return false;
    }

    return true;
  }

  /**
   * Handles edge cases for mood classification
   * @param moodText - The input mood text
   * @returns Object with edge case handling information
   */
  static handleEdgeCases(moodText: string): {
    hasEdgeCase: boolean;
    edgeCaseType?: string;
    recommendation?: MoodClassification;
  } {
    if (!moodText || moodText.trim().length === 0) {
      return {
        hasEdgeCase: true,
        edgeCaseType: 'empty_input',
        recommendation: {
          category: 'neutral',
          confidence: 0.3,
          keywords: generateKeywords('neutral')
        }
      };
    }

    const trimmedText = moodText.trim().toLowerCase();
    
    // Handle very short inputs
    if (trimmedText.length < 3) {
      return {
        hasEdgeCase: true,
        edgeCaseType: 'too_short',
        recommendation: {
          category: 'neutral',
          confidence: 0.2,
          keywords: generateKeywords('neutral')
        }
      };
    }

    // Handle very long inputs
    if (trimmedText.length > 500) {
      return {
        hasEdgeCase: true,
        edgeCaseType: 'too_long',
        recommendation: {
          category: 'neutral',
          confidence: 0.4,
          keywords: generateKeywords('neutral')
        }
      };
    }

    // Handle non-meaningful inputs (numbers, special characters only)
    const meaningfulCharacters = trimmedText.replace(/[^a-zA-Z\s]/g, '').trim();
    if (meaningfulCharacters.length < 2) {
      return {
        hasEdgeCase: true,
        edgeCaseType: 'non_meaningful',
        recommendation: {
          category: 'neutral',
          confidence: 0.2,
          keywords: generateKeywords('neutral')
        }
      };
    }

    return {
      hasEdgeCase: false
    };
  }
}

// Export individual functions for direct use
export {
  analyzeMoodWithFallback,
  analyzeSentiment,
  classifyMood,
  validateMoodInput,
  generateKeywords
} from '@/utils/sentiment';