'use client';

import { MusicGridProps } from '@/types';
import { MusicCard } from '@/components/MusicCard';

export function MusicGrid({ videos, isLoading, error }: MusicGridProps) {
  // Loading state with skeleton components
  if (isLoading) {
    return (
      <div 
        className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8"
        role="status" 
        aria-label="Loading music recommendations"
      >
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="animate-pulse" aria-hidden="true">
              <div className="bg-gray-200 rounded-lg shadow-md overflow-hidden">
                {/* Skeleton thumbnail */}
                <div className="w-full h-36 sm:h-40 md:h-44 lg:h-48 bg-gray-300"></div>
                
                {/* Skeleton content */}
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  {/* Skeleton title */}
                  <div className="h-3 sm:h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 sm:h-4 bg-gray-300 rounded w-1/2"></div>
                  
                  {/* Skeleton channel */}
                  <div className="h-2 sm:h-3 bg-gray-300 rounded w-2/3"></div>
                  
                  {/* Skeleton metadata */}
                  <div className="flex justify-between">
                    <div className="h-2 sm:h-3 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-2 sm:h-3 bg-gray-300 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <span className="sr-only">Loading music recommendations...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center">
          <div className="flex justify-center mb-3 sm:mb-4">
            <svg 
              className="h-10 w-10 sm:h-12 sm:w-12 text-red-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-red-800 mb-2">
            Oops! Terjadi kesalahan
          </h3>
          <p className="text-sm sm:text-base text-red-600 mb-4">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors touch-manipulation"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!videos || videos.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sm:p-8 text-center">
          <div className="flex justify-center mb-3 sm:mb-4">
            <svg 
              className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" 
              />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            Tidak ada lagu ditemukan
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Coba ubah deskripsi mood kamu atau gunakan kata-kata yang berbeda.
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            Contoh: "Aku lagi bahagia" atau "Sedang galau nih"
          </p>
        </div>
      </div>
    );
  }

  // Success state - display music grid
  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
      {/* Results header */}
      <div className="mb-4 sm:mb-6">
        <h2 
          id="music-results-heading"
          className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2"
        >
          Lagu untuk mood kamu
        </h2>
        <p 
          className="text-sm sm:text-base text-gray-600"
          aria-describedby="music-results-heading"
        >
          Ditemukan {videos.length} lagu yang cocok dengan perasaan kamu
        </p>
      </div>

      {/* Responsive music grid */}
      <div 
        className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
        role="grid"
        aria-labelledby="music-results-heading"
      >
        {videos.map((video, index) => (
          <div key={video.id} role="gridcell" aria-rowindex={Math.floor(index / 4) + 1} aria-colindex={(index % 4) + 1}>
            <MusicCard video={video} />
          </div>
        ))}
      </div>
    </div>
  );
}