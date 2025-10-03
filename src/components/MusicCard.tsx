'use client';

import Image from 'next/image';
import { MusicCardProps } from '@/types';
import { useLazyLoading } from '@/hooks';

export function MusicCard({ video }: MusicCardProps) {
  const { ref, shouldLoad } = useLazyLoading({ threshold: 0.1, rootMargin: '100px' });

  // Format view count for display
  const formatViewCount = (viewCount: string): string => {
    const count = parseInt(viewCount);
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Format like count for display
  const formatLikeCount = (likeCount: string): string => {
    const count = parseInt(likeCount);
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Format published date
  const formatPublishedDate = (publishedAt: string): string => {
    const date = new Date(publishedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return '1 hari lalu';
    } else if (diffDays < 7) {
      return `${diffDays} hari lalu`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} minggu lalu`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} bulan lalu`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} tahun lalu`;
    }
  };

  // YouTube video URL
  const youtubeUrl = `https://www.youtube.com/watch?v=${video.id}`;

  return (
    <article 
      ref={ref}
      className="group bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200 transform hover:-translate-y-1"
      role="article"
      aria-labelledby={`video-title-${video.id}`}
    >
      {/* Thumbnail container */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {shouldLoad ? (
          <Image
            src={video.thumbnail}
            alt={`Thumbnail for ${video.title}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            priority={false}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
        )}
        
        {/* Play button overlay */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-red-600 rounded-full p-2 sm:p-3 shadow-lg">
              <svg 
                className="w-4 h-4 sm:w-6 sm:h-6 text-white ml-0.5 sm:ml-1" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {/* Title */}
        <h3 
          id={`video-title-${video.id}`}
          className="font-medium text-gray-900 text-xs sm:text-sm leading-4 sm:leading-5 mb-2 group-hover:text-blue-600 transition-colors" 
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          <a 
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            aria-describedby={`video-meta-${video.id}`}
          >
            {video.title}
          </a>
        </h3>

        {/* Channel */}
        <p className="text-gray-600 text-xs mb-2 sm:mb-3 truncate">
          Channel: {video.channelTitle}
        </p>

        {/* Metadata */}
        <div 
          id={`video-meta-${video.id}`}
          className="flex items-center justify-between text-xs text-gray-500 mb-2 sm:mb-0"
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* View count */}
            <div className="flex items-center space-x-1" title={`${video.viewCount} views`}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
              </svg>
              <span className="text-xs" aria-label={`${formatViewCount(video.viewCount)} views`}>
                {formatViewCount(video.viewCount)}
              </span>
            </div>

            {/* Like count */}
            <div className="flex items-center space-x-1" title={`${video.likeCount} likes`}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
              </svg>
              <span className="text-xs" aria-label={`${formatLikeCount(video.likeCount)} likes`}>
                {formatLikeCount(video.likeCount)}
              </span>
            </div>
          </div>

          {/* Published date - hidden on mobile */}
          <time 
            className="text-gray-400 text-xs hidden sm:inline"
            dateTime={video.publishedAt}
            title={new Date(video.publishedAt).toLocaleDateString('id-ID')}
          >
            {formatPublishedDate(video.publishedAt)}
          </time>
        </div>

        {/* YouTube link button */}
        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full px-2 py-2 sm:px-3 sm:py-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors touch-manipulation"
            aria-label={`Watch ${video.title} on YouTube`}
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span className="hidden sm:inline">Tonton di YouTube</span>
            <span className="sm:hidden">YouTube</span>
          </a>
        </div>
      </div>
    </article>
  );
}