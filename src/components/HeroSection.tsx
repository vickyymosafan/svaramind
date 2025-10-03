'use client';

import { MoodForm } from './MoodForm';

interface HeroSectionProps {
  onMoodSubmit: (mood: string) => void;
  isLoading: boolean;
}

export function HeroSection({ onMoodSubmit, isLoading }: HeroSectionProps) {
  return (
    <section className="py-16 px-4 sm:py-20 sm:px-6 lg:py-24 lg:px-8 bg-white">
      <div className="mx-auto max-w-4xl text-center">
        {/* Hero Title */}
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          Apa yang ingin kamu dengarkan?
        </h1>
        
        {/* Hero Subtitle */}
        <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
          Temukan lagu viral sesuai mood kamu
        </p>
        
        {/* Mood Form */}
        <div className="mt-10">
          <MoodForm onSubmit={onMoodSubmit} isLoading={isLoading} />
        </div>
      </div>
    </section>
  );
}