'use client';

import { HeroSection, MusicGrid } from '@/components';
import { useMusicDiscovery } from '@/hooks';

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
      <main>
        <HeroSection 
          onMoodSubmit={handleMoodSubmit}
          isLoading={isLoading}
        />
        
        {/* Show results section only after first search */}
        {hasSearched && (
          <section className="container mx-auto px-4 py-8">
            {/* Mood Analysis Display */}
            {moodAnalysis && !error && (
              <div className="mb-8 p-4 bg-white rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-2">Mood Analysis</h3>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="capitalize">
                    Sentiment: <strong>{moodAnalysis.sentiment}</strong>
                  </span>
                  <span>
                    Score: <strong>{moodAnalysis.score.toFixed(2)}</strong>
                  </span>
                  <span>
                    Keywords: <strong>{moodAnalysis.keywords}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Error Display with Retry Option */}
            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                      Oops! Something went wrong
                    </h3>
                    <p className="text-red-700 mb-4">{error}</p>
                    {canRetry && (
                      <button
                        onClick={handleRetry}
                        disabled={isLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isLoading ? 'Retrying...' : 'Try Again'}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={clearError}
                    className="text-red-500 hover:text-red-700 text-xl font-bold"
                    aria-label="Close error message"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Results Summary */}
            {!error && stats.hasResults && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Music Recommendations
                </h2>
                <p className="text-gray-600">
                  Found {stats.totalVideos} songs that match your mood
                </p>
              </div>
            )}

            {/* No Results Message */}
            {!error && !stats.hasResults && !isLoading && hasSearched && (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No music found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    We couldn't find any songs matching your mood. Try describing your feelings differently.
                  </p>
                  {canRetry && (
                    <button
                      onClick={handleRetry}
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
