'use client';

import { useState } from 'react';
import { HeroSection } from '@/components';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  const handleMoodSubmit = async (mood: string) => {
    setIsLoading(true);
    try {
      // TODO: This will be implemented in later tasks
      console.log('Mood submitted:', mood);
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Error processing mood:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <HeroSection 
          onMoodSubmit={handleMoodSubmit}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
