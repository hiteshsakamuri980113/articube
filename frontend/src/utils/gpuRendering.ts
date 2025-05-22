/**
 * GPU Rendering Helper Utilities for ArtiCube
 *
 * This module provides utilities to monitor and optimize GPU rendering
 * for better performance in the application, particularly for the search modal.
 */

/**
 * Checks if the browser supports hardware acceleration features
 * @returns Detection results
 */
export const detectHardwareAcceleration = (): {
  supported: boolean;
  gpuRendering: boolean;
  transforms3d: boolean;
  compositingSupport: boolean;
} => {
  const result = {
    supported: false,
    gpuRendering: false,
    transforms3d: false,
    compositingSupport: false,
  };

  // Check for GPU rendering
  const testEl = document.createElement("div");
  ["transform", "webkitTransform", "MozTransform"].forEach((prop) => {
    if (prop in testEl.style) {
      result.gpuRendering = true;
    }
  });

  // Check for 3D transforms
  if (
    "transform-style" in testEl.style ||
    "webkitTransformStyle" in testEl.style
  ) {
    result.transforms3d = true;
  }

  // Check for compositing support
  if ("contain" in testEl.style || "willChange" in testEl.style) {
    result.compositingSupport = true;
  }

  // Overall support
  result.supported =
    result.gpuRendering && (result.transforms3d || result.compositingSupport);

  return result;
};

/**
 * Applies GPU-optimized rendering classes based on device capability
 * @param element The DOM element to optimize
 * @param intensityLevel Level of optimization (1-3, with 3 being most aggressive)
 */
export const applyGPURendering = (
  element: HTMLElement,
  intensityLevel = 2
): void => {
  const capabilities = detectHardwareAcceleration();

  // Basic optimizations for all devices
  element.classList.add("hardware-accelerated");

  if (capabilities.supported) {
    // Medium level optimizations
    if (intensityLevel >= 2) {
      element.style.transform = "translateZ(0)";
      element.style.backfaceVisibility = "hidden";

      if (capabilities.compositingSupport) {
        element.style.willChange = "transform, opacity";
      }
    }

    // High level optimizations
    if (intensityLevel >= 3 && capabilities.transforms3d) {
      element.style.transform = "translate3d(0,0,0)";
      element.style.contain = "paint layout";

      if ("isolation" in element.style) {
        element.style.isolation = "isolate";
      }
    }
  }
};

/**
 * Monitors frame rate during animations and applies optimizations
 * @param targetFPS Target frames per second
 * @param durationMs How long to monitor performance
 * @returns Promise that resolves when monitoring is complete
 */
export const monitorAndOptimizeFrameRate = (
  targetFPS = 58,
  durationMs = 5000
): Promise<{ optimizationsApplied: boolean; detectedFPS: number }> => {
  return new Promise((resolve) => {
    let frameCount = 0;
    let lastTime = performance.now();
    let rafId: number;
    let optimizationsApplied = false;

    // Count frames
    const countFrame = () => {
      frameCount++;
      const now = performance.now();
      const elapsed = now - lastTime;

      // Check if we need to boost performance after 500ms
      if (elapsed > 500 && !optimizationsApplied) {
        const currentFPS = (frameCount / elapsed) * 1000;

        // If frame rate is below target, apply aggressive optimizations
        if (currentFPS < targetFPS) {
          document.body.classList.add("gpu-boost");

          // Find expensive elements and optimize them
          const expensiveElements = document.querySelectorAll(
            ".search-modal-container, .search-result-container, .search-modal-content"
          );

          expensiveElements.forEach((el) => {
            if (el instanceof HTMLElement) {
              applyGPURendering(el, 3);
            }
          });

          optimizationsApplied = true;

          console.info(
            `🚀 Applied performance boost due to low frame rate (${currentFPS.toFixed(
              1
            )} FPS)`
          );
        }
      }

      // Continue monitoring if still within duration
      const totalElapsed = performance.now() - lastTime;
      if (totalElapsed < durationMs) {
        rafId = requestAnimationFrame(countFrame);
      } else {
        // Calculate final FPS
        const finalFPS = (frameCount / totalElapsed) * 1000;

        console.info(
          `📊 Frame rate monitoring complete: ${finalFPS.toFixed(1)} FPS`
        );
        resolve({
          optimizationsApplied,
          detectedFPS: finalFPS,
        });
      }
    };

    // Start monitoring
    rafId = requestAnimationFrame(countFrame);

    // Safety cleanup
    setTimeout(() => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        resolve({
          optimizationsApplied,
          detectedFPS: (frameCount / durationMs) * 1000,
        });
      }
    }, durationMs + 1000);
  });
};

/**
 * Create a DOM observer to detect when heavy rendering is happening
 * and automatically apply optimizations
 */
export const setupPerformanceObserver = (): (() => void) => {
  // Track mutations that might impact performance
  const observer = new MutationObserver((mutations) => {
    // Count added nodes to detect large DOM changes
    let addedNodes = 0;

    mutations.forEach((mutation) => {
      addedNodes += mutation.addedNodes.length;
    });

    // If many nodes added at once (heavy update), apply optimizations
    if (addedNodes > 15) {
      document.body.classList.add("optimize-rendering");

      // Apply GPU rendering to the parent of changed elements
      mutations.forEach((mutation) => {
        const target = mutation.target;
        if (target instanceof HTMLElement && target.parentElement) {
          applyGPURendering(target.parentElement, 2);
        }
      });

      // Remove optimization class after rendering completes
      setTimeout(() => {
        document.body.classList.remove("optimize-rendering");
      }, 1000);
    }
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false,
  });

  // Return disconnect function
  return () => observer.disconnect();
};
