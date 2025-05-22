/**
 * Performance monitoring utilities
 * This module helps measure and track UI performance metrics
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

// Store for performance metrics
const metricsStore: Map<string, PerformanceMetric> = new Map();

/**
 * Start timing a performance metric
 *
 * @param name Identifier for the performance measurement
 * @returns ID for the timing operation
 */
export const startTiming = (name: string): string => {
  const id = `${name}-${Date.now()}`;
  metricsStore.set(id, {
    name,
    startTime: performance.now(),
  });
  return id;
};

/**
 * End timing a performance metric
 *
 * @param id The timing ID returned by startTiming
 * @returns Duration in milliseconds
 */
export const endTiming = (id: string): number | undefined => {
  const metric = metricsStore.get(id);
  if (metric) {
    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    metricsStore.set(id, metric);
    return metric.duration;
  }
  return undefined;
};

/**
 * Log a performance metric to the console
 *
 * @param id The timing ID
 * @param label Optional label for the log
 */
export const logPerformance = (id: string, label?: string): void => {
  const metric = metricsStore.get(id);
  if (metric && metric.duration !== undefined) {
    console.info(
      `%c⚡ Performance: ${label || metric.name} took ${metric.duration.toFixed(
        2
      )}ms`,
      "color: #9c5aff; font-weight: bold;"
    );
  }
};

/**
 * Measure the performance of a function
 *
 * @param fn Function to measure
 * @param name Name for the measurement
 * @returns Result of the function
 */
export const measurePerformance = async <T>(
  fn: () => Promise<T> | T,
  name: string
): Promise<T> => {
  const id = startTiming(name);
  try {
    const result = await fn();
    endTiming(id);
    logPerformance(id);
    return result;
  } catch (error) {
    endTiming(id);
    logPerformance(id, `${name} (error)`);
    throw error;
  }
};

/**
 * Measure the First Contentful Paint (FCP) when the modal opens
 *
 * @param targetSelector CSS selector for the element to observe
 * @returns Promise that resolves when the element is visible
 */
export const measureModalFCP = (targetSelector: string): Promise<number> => {
  return new Promise((resolve) => {
    // Use PerformanceObserver if available
    if ("PerformanceObserver" in window) {
      const start = performance.now();

      // Create an observer to watch for the element becoming visible
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const duration = performance.now() - start;
            observer.disconnect();
            console.info(
              `%c⚡ Modal FCP: ${duration.toFixed(2)}ms`,
              "color: #9c5aff; font-weight: bold;"
            );
            resolve(duration);
          }
        });
      });

      // Start observing as soon as the element exists
      const checkForElement = setInterval(() => {
        const element = document.querySelector(targetSelector);
        if (element) {
          clearInterval(checkForElement);
          observer.observe(element);
        }
      }, 10);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkForElement);
        observer.disconnect();
        resolve(Infinity);
      }, 5000);
    } else {
      // Fallback for browsers without IntersectionObserver
      resolve(0);
    }
  });
};

/**
 * Track frame rate during animations
 *
 * @param durationMs How long to track frame rate
 * @returns Promise that resolves with average FPS
 */
export const trackFrameRate = (durationMs: number = 2000): Promise<number> => {
  return new Promise((resolve) => {
    let frameCount = 0;
    let lastFrameTime = performance.now();

    const countFrame = () => {
      frameCount++;
      lastFrameTime = performance.now();
      requestAnimationFrame(countFrame);
    };

    requestAnimationFrame(countFrame);

    // Calculate average FPS after the duration
    setTimeout(() => {
      const fps = (frameCount * 1000) / durationMs;
      console.info(
        `%c🎞️ Animation framerate: ${fps.toFixed(1)} FPS over ${durationMs}ms`,
        "color: #5a9eff; font-weight: bold;"
      );
      resolve(fps);
    }, durationMs);
  });
};
