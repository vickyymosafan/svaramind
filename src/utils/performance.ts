/**
 * Performance monitoring and optimization utilities
 */

/**
 * Measure and log performance metrics
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const start = performance.now();
  
  const result = fn();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const end = performance.now();
      logPerformanceMetric(name, end - start);
    });
  } else {
    const end = performance.now();
    logPerformanceMetric(name, end - start);
    return result;
  }
}

/**
 * Log performance metrics
 */
function logPerformanceMetric(name: string, duration: number): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`⚡ Performance: ${name} took ${duration.toFixed(2)}ms`);
  }
  
  // In production, you might want to send to analytics
  if (process.env.NODE_ENV === 'production' && duration > 1000) {
    console.warn(`⚠️ Slow operation: ${name} took ${duration.toFixed(2)}ms`);
  }
}

/**
 * Debounce function for performance optimization
 */
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

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Lazy load images with intersection observer
 */
export function createImageLazyLoader(): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }
  
  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
        }
      }
    });
  });
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources(): void {
  if (typeof window === 'undefined') return;
  
  // Preload YouTube thumbnail domains
  const link1 = document.createElement('link');
  link1.rel = 'dns-prefetch';
  link1.href = '//i.ytimg.com';
  document.head.appendChild(link1);
  
  const link2 = document.createElement('link');
  link2.rel = 'dns-prefetch';
  link2.href = '//img.youtube.com';
  document.head.appendChild(link2);
  
  // Preload YouTube API
  const link3 = document.createElement('link');
  link3.rel = 'dns-prefetch';
  link3.href = '//www.googleapis.com';
  document.head.appendChild(link3);
}

/**
 * Monitor Core Web Vitals
 */
export function monitorWebVitals(): void {
  if (typeof window === 'undefined') return;
  
  // Monitor Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 LCP:', lastEntry.startTime);
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('Failed to observe LCP:', error);
    }
  }
  
  // Monitor First Input Delay (FID)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('📊 FID:', entry.processingStart - entry.startTime);
          }
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('Failed to observe FID:', error);
    }
  }
}

/**
 * Initialize performance monitoring
 */
export function initializePerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;
  
  // Preload critical resources
  preloadCriticalResources();
  
  // Monitor web vitals
  monitorWebVitals();
  
  // Log initial page load performance
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Page Load Metrics:');
      console.log(`  - DOM Content Loaded: ${navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart}ms`);
      console.log(`  - Load Complete: ${navigation.loadEventEnd - navigation.loadEventStart}ms`);
      console.log(`  - Total Load Time: ${navigation.loadEventEnd - navigation.fetchStart}ms`);
    }
  });
}