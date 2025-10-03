import { SentimentResult, MoodClassification } from '@/types';
import { MOOD_KEYWORDS, SENTIMENT_THRESHOLDS } from '@/config/constants';

// Lazy-loaded sentiment analyzer to avoid server-side issues
let sentimentAnalyzer: any = null;

/**
 * Initialize sentiment analyzer with error handling
 */
async function initializeSentiment(): Promise<any> {
  if (sentimentAnalyzer) {
    return sentimentAnalyzer;
  }

  try {
    // Dynamic import to avoid server-side issues
    const Sentiment = await import('sentiment');
    sentimentAnalyzer = new (Sentiment.default || Sentiment)();
    return sentimentAnalyzer;
  } catch (error) {
    console.error('Failed to initialize sentiment library:', error);
    return null;
  }
}

/**
 * Simple keyword-based sentiment analysis fallback
 */
function analyzeKeywordSentiment(text: string): SentimentResult {
  const lowerText = text.toLowerCase();
  
  // Positive keywords
  const positiveWords = [
    'happy', 'joy', 'excited', 'great', 'awesome', 'amazing', 'wonderful', 'fantastic',
    'love', 'good', 'excellent', 'perfect', 'brilliant', 'cheerful', 'delighted',
    'energetic', 'upbeat', 'positive', 'optimistic', 'confident', 'motivated'
  ];
  
  // Negative keywords
  const negativeWords = [
    'sad', 'angry', 'depressed', 'upset', 'frustrated', 'disappointed', 'terrible',
    'awful', 'bad', 'horrible', 'hate', 'annoyed', 'stressed', 'worried', 'anxious',
    'lonely', 'tired', 'exhausted', 'overwhelmed', 'down', 'melancholy'
  ];
  
  let positiveScore = 0;
  let negativeScore = 0;
  const words = lowerText.split(/\s+/);
  
  words.forEach(word => {
    if (positiveWords.includes(word)) positiveScore++;
    if (negativeWords.includes(word)) negativeScore++;
  });
  
  const score = positiveScore - negativeScore;
  const comparative = score / words.length;
  
  return {
    score,
    comparative,
    calculation: [],
    tokens: words,
    words: words,
    positive: positiveWords.filter(word => lowerText.includes(word)),
    negative: negativeWords.filter(word => lowerText.includes(word))
  };
}

/**
 * Analyzes the sentiment of input text using the sentiment library with fallback
 * @param text - The input text to analyze
 * @returns SentimentResult with score, comparative, and token analysis
 */
export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  if (!text || text.trim().length === 0) {
    throw new Error('Input text cannot be empty');
  }

  try {
    // Try to use the sentiment library first
    const sentiment = await initializeSentiment();
    
    if (sentiment) {
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
    } else {
      // Fallback to keyword-based analysis
      console.warn('Using keyword-based sentiment analysis fallback');
      return analyzeKeywordSentiment(text);
    }
  } catch (error) {
    console.error('Error analyzing sentiment, using fallback:', error);
    // Use keyword-based fallback
    return analyzeKeywordSentiment(text);
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
export async function analyzeMoodWithFallback(text: string): Promise<MoodClassification> {
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

    // Perform sentiment analysis (now async)
    const sentimentResult = await analyzeSentiment(text);
    
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