import React from 'react';

interface NetworkErrorFallbackProps {
  error?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

/**
 * Network Error Fallback Component
 * Displays user-friendly error messages for network-related issues
 */
export function NetworkErrorFallback({ 
  error = 'Unable to connect to the server', 
  onRetry,
  showRetry = true 
}: NetworkErrorFallbackProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center max-w-md mx-auto">
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg 
          className="w-8 h-8 text-orange-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Connection Problem
      </h3>
      
      <p className="text-gray-600 mb-4">
        {error}
      </p>
      
      <p className="text-sm text-gray-500 mb-4">
        Please check your internet connection and try again.
      </p>
      
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

/**
 * API Error Fallback Component
 */
export function APIErrorFallback({ 
  error = 'Service temporarily unavailable', 
  onRetry 
}: NetworkErrorFallbackProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center max-w-md mx-auto">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg 
          className="w-8 h-8 text-red-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
          />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Service Error
      </h3>
      
      <p className="text-gray-600 mb-4">
        {error}
      </p>
      
      <p className="text-sm text-gray-500 mb-4">
        Our music service is experiencing issues. Please try again in a few moments.
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

/**
 * No Results Fallback Component
 */
export function NoResultsFallback({ 
  message = 'No music found for your mood',
  suggestion = 'Try describing your mood differently or use different keywords.'
}: {
  message?: string;
  suggestion?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center max-w-md mx-auto">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg 
          className="w-8 h-8 text-gray-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.664-2.647M15 3.5A7.5 7.5 0 108.5 21 7.5 7.5 0 0015 3.5z" 
          />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No Results Found
      </h3>
      
      <p className="text-gray-600 mb-2">
        {message}
      </p>
      
      <p className="text-sm text-gray-500">
        {suggestion}
      </p>
    </div>
  );
}