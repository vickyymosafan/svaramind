import { useState, useCallback } from 'react';
import { YouTubeVideo, MusicAPIResponse } from '../types';
import { discoverMusic, getErrorMessage, APIError } from '../services/apiClient';

/**
 * State interface for music discovery
 */
interface MusicDiscoveryState {
  // Data state
  videos: YouTubeVideo[];
  moodAnalysis: {
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
    keywords: string;
  } | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  
  // Current search context
  currentMood: string;
  currentLanguage: 'id' | 'en';
}

/**
 * Initial state
 */
const initialState: MusicDiscoveryState = {
  videos: [],
  moodAnalysis: null,
  isLoading: false,
  error: null,
  hasSearched: false,
  currentMood: '',
  currentLanguage: 'id',
};

/**
 * Custom hook for managing music discovery state and operations
 */
export function useMusicDiscovery() {
  const [state, setState] = useState<MusicDiscoveryState>(initialState);

  /**
   * Reset state to initial values
   */
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Set loading state
   */
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  /**
   * Main function to search for music based on mood
   */
  const searchMusic = useCallback(async (
    mood: string, 
    language: 'id' | 'en' = 'id'
  ): Promise<void> => {
    // Validation
    if (!mood || mood.trim().length < 3) {
      setState(prev => ({
        ...prev,
        error: 'Mood description must be at least 3 characters long',
        isLoading: false
      }));
      return;
    }

    // Set loading state and clear previous error
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      currentMood: mood.trim(),
      currentLanguage: language
    }));

    try {
      const response: MusicAPIResponse = await discoverMusic(mood, language);

      if (response.success && response.data) {
        // Success case
        setState(prev => ({
          ...prev,
          videos: response.data || [],
          moodAnalysis: response.mood_analysis || null,
          isLoading: false,
          error: null,
          hasSearched: true
        }));
      } else {
        // API returned error
        setState(prev => ({
          ...prev,
          videos: [],
          moodAnalysis: null,
          isLoading: false,
          error: response.error || 'Failed to fetch music recommendations',
          hasSearched: true
        }));
      }
    } catch (error) {
      // Handle network or other errors
      const errorMessage = getErrorMessage(error);
      
      setState(prev => ({
        ...prev,
        videos: [],
        moodAnalysis: null,
        isLoading: false,
        error: errorMessage,
        hasSearched: true
      }));

      // Log error for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.error('Music discovery error:', error);
      }
    }
  }, []);

  /**
   * Retry the last search
   */
  const retrySearch = useCallback(async (): Promise<void> => {
    if (state.currentMood) {
      await searchMusic(state.currentMood, state.currentLanguage);
    }
  }, [state.currentMood, state.currentLanguage, searchMusic]);

  /**
   * Check if we can retry (has previous search context)
   */
  const canRetry = Boolean(state.currentMood && !state.isLoading);

  /**
   * Get summary statistics
   */
  const stats = {
    totalVideos: state.videos.length,
    hasResults: state.videos.length > 0,
    hasError: Boolean(state.error),
    isFirstSearch: !state.hasSearched,
  };

  return {
    // State
    videos: state.videos,
    moodAnalysis: state.moodAnalysis,
    isLoading: state.isLoading,
    error: state.error,
    hasSearched: state.hasSearched,
    currentMood: state.currentMood,
    currentLanguage: state.currentLanguage,
    
    // Actions
    searchMusic,
    retrySearch,
    reset,
    clearError,
    setLoading,
    
    // Computed values
    canRetry,
    stats,
  };
}

/**
 * Hook for form-specific state management
 * Separates form logic from main music discovery logic
 */
export function useMoodForm() {
  const [mood, setMood] = useState('');
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [validationError, setValidationError] = useState<string | null>(null);

  /**
   * Validate mood input
   */
  const validateMood = useCallback((moodText: string): boolean => {
    if (!moodText || moodText.trim().length === 0) {
      setValidationError('Please describe your mood');
      return false;
    }
    
    if (moodText.trim().length < 3) {
      setValidationError('Mood description must be at least 3 characters long');
      return false;
    }
    
    if (moodText.trim().length > 500) {
      setValidationError('Mood description is too long (max 500 characters)');
      return false;
    }

    setValidationError(null);
    return true;
  }, []);

  /**
   * Handle mood input change with validation
   */
  const handleMoodChange = useCallback((value: string) => {
    setMood(value);
    
    // Clear validation error when user starts typing
    if (validationError && value.trim().length > 0) {
      setValidationError(null);
    }
  }, [validationError]);

  /**
   * Handle language change
   */
  const handleLanguageChange = useCallback((lang: 'id' | 'en') => {
    setLanguage(lang);
  }, []);

  /**
   * Reset form
   */
  const resetForm = useCallback(() => {
    setMood('');
    setLanguage('id');
    setValidationError(null);
  }, []);

  /**
   * Get form submission data if valid
   */
  const getFormData = useCallback(() => {
    if (validateMood(mood)) {
      return {
        mood: mood.trim(),
        language,
      };
    }
    return null;
  }, [mood, language, validateMood]);

  return {
    // Form state
    mood,
    language,
    validationError,
    
    // Form actions
    handleMoodChange,
    handleLanguageChange,
    validateMood,
    resetForm,
    getFormData,
    
    // Computed values
    isValid: !validationError && mood.trim().length >= 3,
    isEmpty: mood.trim().length === 0,
  };
}