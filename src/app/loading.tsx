import { LoadingFallback } from '@/components/LoadingFallback';

/**
 * Next.js Loading Page Component
 * Shown during page transitions and initial loading
 */
export default function Loading() {
  return (
    <LoadingFallback 
      message="Loading music discovery app..." 
      size="lg" 
      fullScreen={true} 
    />
  );
}