'use client';

import { useState } from 'react';

interface MoodFormProps {
  onSubmit: (mood: string) => void;
  isLoading: boolean;
}

export function MoodForm({ onSubmit, isLoading }: MoodFormProps) {
  const [mood, setMood] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!mood.trim()) {
      setError('Mohon masukkan deskripsi mood kamu');
      return;
    }
    
    if (mood.trim().length < 3) {
      setError('Deskripsi mood minimal 3 karakter');
      return;
    }
    
    // Clear error and submit
    setError('');
    onSubmit(mood.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMood(e.target.value);
    if (error) {
      setError(''); // Clear error when user starts typing
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="w-full max-w-2xl mx-auto px-2 sm:px-0"
      role="search"
      aria-label="Mood-based music search form"
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Textarea Input */}
        <div>
          <label htmlFor="mood-input" className="sr-only">
            Deskripsi mood kamu
          </label>
          <textarea
            id="mood-input"
            value={mood}
            onChange={handleInputChange}
            placeholder="Ceritakan mood kamu saat ini... (contoh: 'Aku lagi sedih karena putus sama pacar' atau 'Hari ini aku bahagia banget!')"
            className={`w-full px-3 py-3 sm:px-4 sm:py-4 text-sm sm:text-base border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              error 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
            rows={4}
            disabled={isLoading}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'mood-error' : undefined}
            required
            minLength={3}
            maxLength={500}
          />
          
          {/* Error Message */}
          {error && (
            <p id="mood-error" className="mt-2 text-sm text-red-600" role="alert" aria-live="polite">
              {error}
            </p>
          )}
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading || !mood.trim()}
            className={`w-full sm:w-auto min-w-[200px] px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-medium rounded-lg transition-all duration-200 touch-manipulation ${
              isLoading || !mood.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-blue-800 active:scale-95'
            }`}
            aria-label={isLoading ? 'Sedang mencari lagu...' : 'Cari lagu berdasarkan mood'}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg 
                  className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-current" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span aria-live="polite">Mencari lagu...</span>
              </span>
            ) : (
              'Cari Lagu'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}