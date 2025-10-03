'use client';

import { useEffect } from 'react';
import { HeroSection, MusicGrid } from '@/components';
import { useMusicDiscovery } from '@/hooks';
import { initializePerformanceMonitoring } from '@/utils/performance';

export default function Home() {
  const {
    videos,
    moodAnalysis,
    isLoading,
    error,
    hasSearched,
    searchMusic,
    retrySearch,
    clearError,
    canRetry,
    stats
  } = useMusicDiscovery();

  // Initialize performance monitoring
  useEffect(() => {
    initializePerformanceMonitoring();
  }, []);

  const handleMoodSubmit = async (mood: string) => {
    // Clear any previous errors
    clearError();
    
    // Search for music based on mood
    await searchMusic(mood, 'id'); // Default to Indonesian
  };

  const handleRetry = async () => {
    if (canRetry) {
      await retrySearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main role="main">
        <HeroSection 
          onMoodSubmit={handleMoodSubmit}
          isLoading={isLoading}
        />
        
        {/* Show results section only after first search */}
        {hasSearched && (
          <section 
            className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8"
            aria-label="Music search results"
          >
            {/* Mood Analysis Display */}
            {moodAnalysis && !error && (
              <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-white rounded-lg shadow-sm border" role="region" aria-labelledby="mood-analysis-heading">
                <h3 id="mood-analysis-heading" className="text-base sm:text-lg font-semibold mb-2">Mood Analysis</h3>
                <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                  <span className="capitalize">
                    Sentiment: <strong>{moodAnalysis.sentiment}</strong>
                  </span>
                  <span>
                    Score: <strong>{moodAnalysis.score.toFixed(2)}</strong>
                  </span>
                  <span className="w-full sm:w-auto">
                    Keywords: <strong>{moodAnalysis.keywords}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Error Display with Retry Option */}
            {error && (
              <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-2">
                      Oops! Something went wrong
                    </h3>
                    <p className="text-sm sm:text-base text-red-700 mb-3 sm:mb-4 break-words">{error}</p>
                    {canRetry && (
                      <button
                        onClick={handleRetry}
                        disabled={isLoading}
                        className="px-3 py-2 sm:px-4 sm:py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                      >
                        {isLoading ? 'Retrying...' : 'Try Again'}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={clearError}
                    className="text-red-500 hover:text-red-700 text-lg sm:text-xl font-bold ml-2 flex-shrink-0"
                    aria-label="Close error message"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Results Summary */}
            {!error && stats.hasResults && (
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Music Recommendations
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Found {stats.totalVideos} songs that match your mood
                </p>
              </div>
            )}

            {/* No Results Message */}
            {!error && !stats.hasResults && !isLoading && hasSearched && (
              <div className="text-center py-8 sm:py-12">
                <div className="text-gray-500 mb-4">
                  <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                  </svg>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    No music found
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 max-w-md mx-auto">
                    We couldn't find any songs matching your mood. Try describing your feelings differently.
                  </p>
                  {canRetry && (
                    <button
                      onClick={handleRetry}
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                    >
                      {isLoading ? 'Searching...' : 'Try Again'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Music Grid */}
            <MusicGrid 
              videos={videos}
              isLoading={isLoading}
              error={error || undefined}
            />
          </section>
        )}
      </main>
    </div>
  );
}
