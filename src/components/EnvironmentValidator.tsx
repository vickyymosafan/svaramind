'use client';

import { useEffect, useState } from 'react';

interface ValidationStatus {
  isValidating: boolean;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Client-side environment validation component
 * Validates environment configuration and displays status to users
 */
export function EnvironmentValidator({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ValidationStatus>({
    isValidating: true,
    isValid: false,
    errors: [],
    warnings: []
  });

  useEffect(() => {
    // Perform client-side validation check
    const validateClientEnvironment = async () => {
      try {
        // Check if the API endpoint is accessible
        const response = await fetch('/api/health', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStatus({
            isValidating: false,
            isValid: true,
            errors: [],
            warnings: data.warnings || []
          });
        } else {
          setStatus({
            isValidating: false,
            isValid: false,
            errors: ['API endpoint not accessible'],
            warnings: []
          });
        }
      } catch (error) {
        // If health check fails, assume environment is still valid
        // This prevents blocking the app if health endpoint doesn't exist yet
        console.warn('Environment health check failed, continuing with app load:', error);
        setStatus({
          isValidating: false,
          isValid: true,
          errors: [],
          warnings: ['Unable to verify environment configuration']
        });
      }
    };

    validateClientEnvironment();
  }, []);

  // Show loading state during validation
  if (status.isValidating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating environment configuration...</p>
        </div>
      </div>
    );
  }

  // Show error state if validation fails
  if (!status.isValid && status.errors.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Configuration Error</h2>
            <p className="text-gray-600 mb-4">
              There was an issue with the application configuration. Please contact support.
            </p>
          </div>
          
          <div className="space-y-2">
            {status.errors.map((error, index) => (
              <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => window.location.reload()} 
            className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show warnings if any (but still render the app)
  const showWarnings = status.warnings.length > 0;

  return (
    <>
      {showWarnings && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Configuration warnings detected:
              </p>
              <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside">
                {status.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
}