'use client';

import { MoodForm } from './MoodForm';

interface HeroSectionProps {
  onMoodSubmit: (mood: string) => void;
  isLoading: boolean;
}

export function HeroSection({ onMoodSubmit, isLoading }: HeroSectionProps) {
  return (
    <section 
      className="py-12 px-4 sm:py-16 sm:px-6 md:py-20 lg:py-24 xl:py-28 bg-white"
      aria-labelledby="hero-title"
      role="banner"
    >
      <div className="mx-auto max-w-4xl text-center">
        {/* Hero Title */}
        <h1 
          id="hero-title"
          className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight"
        >
          Apa yang ingin kamu dengarkan?
        </h1>
        
        {/* Hero Subtitle */}
        <p 
          className="mt-4 text-base leading-6 text-gray-600 sm:mt-6 sm:text-lg sm:leading-7 md:text-xl md:leading-8 max-w-2xl mx-auto"
          aria-describedby="hero-title"
        >
          Temukan lagu viral sesuai mood kamu
        </p>
        
        {/* Mood Form */}
        <div className="mt-8 sm:mt-10 md:mt-12">
          <MoodForm onSubmit={onMoodSubmit} isLoading={isLoading} />
        </div>
      </div>
    </section>
  );
}