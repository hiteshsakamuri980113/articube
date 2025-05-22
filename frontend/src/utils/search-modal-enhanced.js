/**
 * File: search-modal-enhanced.js
 * This script provides enhanced modal performance optimizations
 * It's loaded dynamically when needed to prevent unnecessary page bloat
 */

// Use IntersectionObserver for lazy loading content in the search modal
const setupLazyLoading = () => {
  // Only run if IntersectionObserver is supported
  if ("IntersectionObserver" in window) {
    const options = {
      root: document.querySelector(".search-modal-content"),
      rootMargin: "100px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // If element is visible, add a class to enhance it
          entry.target.classList.add("content-visible");

          // Handle images and media content specially for true lazy loading
          const lazyImages = entry.target.querySelectorAll("[data-src]");
          lazyImages.forEach((img) => {
            if (img instanceof HTMLImageElement && img.dataset.src) {
              img.src = img.dataset.src;
              delete img.dataset.src;
            }
          });

          // Stop observing it
          observer.unobserve(entry.target);
        }
      });
    }, options);

    // Observe sidebar sections and results
    document
      .querySelectorAll(".sidebar-section, .search-results-main")
      .forEach((el) => {
        observer.observe(el);
      });
  }
};

// Optimize scrolling performance with advanced techniques
const optimizeScroll = () => {
  const scrollElements = document.querySelectorAll(".optimize-scrolling");

  scrollElements.forEach((el) => {
    if (el instanceof HTMLElement) {
      // Apply standard scroll optimizations
      el.style.willChange = "scroll-position";
      el.style.backfaceVisibility = "hidden";
      el.style.webkitOverflowScrolling = "touch";

      // Apply scroll mask for smooth edge fading
      el.style.maskImage =
        "linear-gradient(to bottom, transparent, black 10px, black calc(100% - 10px), transparent)";
      el.style.webkitMaskImage =
        "linear-gradient(to bottom, transparent, black 10px, black calc(100% - 10px), transparent)";

      // Set up passive scroll listeners for better performance
      el.addEventListener("scroll", () => {}, { passive: true });

      // Add scroll snap for improved UX on mobile
      el.style.scrollSnapType = "y proximity";

      // Mark important elements with scroll-snap-align
      el.querySelectorAll(".search-result-item, .section-heading").forEach(
        (item) => {
          if (item instanceof HTMLElement) {
            item.style.scrollSnapAlign = "start";
          }
        }
      );
    }
  });
};

// Apply hardware acceleration to animations with advanced GPU hints
const optimizeAnimations = () => {
  document.querySelectorAll(".hardware-accelerated").forEach((el) => {
    if (el instanceof HTMLElement) {
      el.style.transform = "translateZ(0)";
      el.style.webkitTransform = "translateZ(0)";
      el.style.willChange = "transform, opacity";

      // Add compositing hint
      el.style.contain = "paint layout";

      // Optimize paint layer
      el.style.isolation = "isolate";
    }
  });
};

// Setup for virtualized search results rendering
const setupVirtualizedResults = () => {
  const resultsContainer = document.querySelector(".search-results-container");
  if (!resultsContainer || !(resultsContainer instanceof HTMLElement)) return;

  // Only apply virtualization for large result sets
  const resultItems = resultsContainer.querySelectorAll(".search-result-item");
  if (resultItems.length < 20) return; // Only virtualize for 20+ items

  // Create a virtualized container
  const virtualContainer = document.createElement("div");
  virtualContainer.className = "virtualized-results-container";
  virtualContainer.style.position = "relative";
  virtualContainer.style.height = `${resultItems.length * 80}px`; // Assuming 80px per item
  virtualContainer.style.width = "100%";

  // Clear and replace with virtualized container
  const originalContent = resultsContainer.innerHTML;
  resultsContainer.innerHTML = "";
  resultsContainer.appendChild(virtualContainer);

  // Save original items for reference
  const originalItems = Array.from(resultItems).map((item) => item.outerHTML);

  // Handle scroll events to render only visible items
  let ticking = false;
  resultsContainer.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = resultsContainer.scrollTop;
          const viewportHeight = resultsContainer.clientHeight;

          // Calculate visible range (with buffer)
          const itemHeight = 80; // Estimated height
          const bufferItems = 5; // Extra items to render above/below viewport

          const startIndex = Math.max(
            0,
            Math.floor(scrollTop / itemHeight) - bufferItems
          );
          const endIndex = Math.min(
            originalItems.length - 1,
            Math.ceil((scrollTop + viewportHeight) / itemHeight) + bufferItems
          );

          // Render only visible items
          let visibleContent = "";
          for (let i = startIndex; i <= endIndex; i++) {
            const topPosition = i * itemHeight;
            visibleContent += `<div style="position: absolute; top: ${topPosition}px; left: 0; width: 100%;">
            ${originalItems[i]}
          </div>`;
          }
          virtualContainer.innerHTML = visibleContent;
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  // Trigger initial render
  resultsContainer.dispatchEvent(new Event("scroll"));
};

// Optimize modal transitions with predictive pre-rendering
const optimizeModalTransitions = () => {
  // Pre-render modal content as soon as the user starts typing in search field
  const searchInputs = document.querySelectorAll(
    'input[type="text"][placeholder*="search"], input[type="search"]'
  );
  searchInputs.forEach((input) => {
    if (input instanceof HTMLInputElement) {
      input.addEventListener("focus", () => {
        // Add preload class to body to hint at upcoming modal
        document.body.classList.add("prepare-modal");
      });

      input.addEventListener("input", () => {
        // Pre-load resources that might be needed for search
        if (input.value.length >= 3) {
          const preloadLink = document.createElement("link");
          preloadLink.rel = "preload";
          preloadLink.as = "fetch";
          preloadLink.href = "/api/search/prefetch";
          document.head.appendChild(preloadLink);
        }
      });
    }
  });
};

// Main initialization function
export const initSearchModalOptimizations = () => {
  // Record start time for performance monitoring
  const startTime = performance.now();

  // Initialize all optimizations
  setupLazyLoading();
  optimizeScroll();
  optimizeAnimations();
  setupVirtualizedResults();
  optimizeModalTransitions();

  // Log performance metrics
  const duration = performance.now() - startTime;
  console.log(
    `⚡ Search modal optimizations initialized in ${duration.toFixed(2)}ms`
  );

  // Return a cleanup function
  return () => {
    // Clear any optimizations that might cause memory leaks
    document.querySelectorAll(".hardware-accelerated").forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.willChange = "auto";
        el.style.contain = "none";
      }
    });
  };
};

// Make available globally
window.initSearchModalOptimizations = initSearchModalOptimizations;
