import Sentiment from 'sentiment';
import { SentimentResult, MoodClassification } from '@/types';
import { MOOD_KEYWORDS, SENTIMENT_THRESHOLDS } from '@/config/constants';

// Initialize sentiment analyzer
const sentiment = new Sentiment();

/**
 * Analyzes the sentiment of input text using the sentiment library
 * @param text - The input text to analyze
 * @returns SentimentResult with score, comparative, and token analysis
 */
export function analyzeSentiment(text: string): SentimentResult {
  if (!text || text.trim().length === 0) {
    throw new Error('Input text cannot be empty');
  }

  try {
    const result = sentiment.analyze(text);
    
    return {
      score: result.score,
      comparative: result.comparative,
      calculation: result.calculation || [],
      tokens: result.tokens,
      words: result.words,
      positive: result.positive,
      negative: result.negative
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw new Error('Failed to analyze sentiment');
  }
}

/**
 * Classifies mood based on sentiment analysis results
 * @param sentimentResult - The result from sentiment analysis
 * @returns MoodClassification with category, confidence, and keywords
 */
export function classifyMood(sentimentResult: SentimentResult): MoodClassification {
  const { score, comparative } = sentimentResult;
  
  // Positive mood classification
  if (score > SENTIMENT_THRESHOLDS.positive.score || comparative > SENTIMENT_THRESHOLDS.positive.comparative) {
    return {
      category: 'positive',
      confidence: Math.min(Math.abs(score) / 5, 1), // Normalize to 0-1 range
      keywords: MOOD_KEYWORDS.positive
    };
  }
  
  // Negative mood classification
  if (score < SENTIMENT_THRESHOLDS.negative.score || comparative < SENTIMENT_THRESHOLDS.negative.comparative) {
    return {
      category: 'negative',
      confidence: Math.min(Math.abs(score) / 5, 1), // Normalize to 0-1 range
      keywords: MOOD_KEYWORDS.negative
    };
  }
  
  // Neutral mood classification (default)
  return {
    category: 'neutral',
    confidence: 0.5,
    keywords: MOOD_KEYWORDS.neutral
  };
}

/**
 * Generates search keywords based on mood category
 * @param moodCategory - The classified mood category
 * @returns String of keywords for music search
 */
export function generateKeywords(moodCategory: 'positive' | 'negative' | 'neutral'): string {
  return MOOD_KEYWORDS[moodCategory];
}

/**
 * Validates input text for sentiment analysis
 * @param text - The input text to validate
 * @returns boolean indicating if text is valid
 */
export function validateMoodInput(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }
  
  const trimmedText = text.trim();
  return trimmedText.length >= 3 && trimmedText.length <= 500;
}

/**
 * Handles edge cases and provides fallback for sentiment analysis
 * @param text - The input text
 * @returns MoodClassification with fallback handling
 */
export function analyzeMoodWithFallback(text: string): MoodClassification {
  try {
    // Validate input
    if (!validateMoodInput(text)) {
      console.warn('Invalid mood input, using neutral fallback');
      return {
        category: 'neutral',
        confidence: 0.3,
        keywords: MOOD_KEYWORDS.neutral
      };
    }

    // Perform sentiment analysis
    const sentimentResult = analyzeSentiment(text);
    
    // Classify mood
    const moodClassification = classifyMood(sentimentResult);
    
    return moodClassification;
    
  } catch (error) {
    console.error('Error in mood analysis, using fallback:', error);
    
    // Fallback to neutral mood
    return {
      category: 'neutral',
      confidence: 0.2,
      keywords: MOOD_KEYWORDS.neutral
    };
  }
}