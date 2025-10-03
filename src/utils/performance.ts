// Performance monitoring utilities

export const measurePerformance = {
  // Measure time for async operations
  async measureAsync<T>(
    name: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await operation();
      const end = performance.now();
      console.log(`${name} took ${end - start} milliseconds`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`${name} failed after ${end - start} milliseconds`, error);
      throw error;
    }
  },

  // Measure time for sync operations
  measureSync<T>(name: string, operation: () => T): T {
    const start = performance.now();
    try {
      const result = operation();
      const end = performance.now();
      console.log(`${name} took ${end - start} milliseconds`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`${name} failed after ${end - start} milliseconds`, error);
      throw error;
    }
  },

  // Report Web Vitals
  reportWebVitals: (metric: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(metric);
    }
    // In production, you might want to send this to an analytics service
  },
};

// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Preload critical resources
export const preloadResource = (href: string, as: string) => {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }
};

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Optimize images based on device capabilities
export const getOptimalImageSize = (
  baseWidth: number,
  baseHeight: number
): { width: number; height: number } => {
  if (typeof window === 'undefined') {
    return { width: baseWidth, height: baseHeight };
  }

  const devicePixelRatio = window.devicePixelRatio || 1;
  const screenWidth = window.screen.width;
  
  // Adjust image size based on screen size and pixel ratio
  let optimalWidth = baseWidth;
  
  if (screenWidth <= 640) {
    optimalWidth = Math.min(baseWidth, 640);
  } else if (screenWidth <= 1024) {
    optimalWidth = Math.min(baseWidth, 800);
  }
  
  // Account for high DPI displays
  optimalWidth *= Math.min(devicePixelRatio, 2);
  
  const aspectRatio = baseHeight / baseWidth;
  const optimalHeight = optimalWidth * aspectRatio;
  
  return {
    width: Math.round(optimalWidth),
    height: Math.round(optimalHeight),
  };
};

export default {
  measurePerformance,
  debounce,
  throttle,
  preloadResource,
  prefersReducedMotion,
  getOptimalImageSize,
};