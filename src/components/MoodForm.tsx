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
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="space-y-4">
        {/* Textarea Input */}
        <div>
          <textarea
            value={mood}
            onChange={handleInputChange}
            placeholder="Ceritakan mood kamu saat ini... (contoh: 'Aku lagi sedih karena putus sama pacar' atau 'Hari ini aku bahagia banget!')"
            className={`w-full px-4 py-3 text-base border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              error 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
            rows={4}
            disabled={isLoading}
          />
          
          {/* Error Message */}
          {error && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !mood.trim()}
          className={`w-full sm:w-auto px-8 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
            isLoading || !mood.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-blue-800'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg 
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
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
              Mencari lagu...
            </span>
          ) : (
            'Cari Lagu'
          )}
        </button>
      </div>
    </form>
  );
}