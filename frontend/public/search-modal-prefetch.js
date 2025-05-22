/**
 * search-modal-prefetch.js
 * This script helps optimize the loading of the search modal
 * by preloading assets and components when user interaction suggests
 * they might open the modal soon.
 */

// Track user intent to determine when to preload search modal
const trackUserIntent = () => {
  const searchElements = document.querySelectorAll(
    'input[type="text"], button'
  );
  let userHoveredSearchElements = false;
  let userHasBeenIdleOnPage = false;

  // After user has been on page for 2 seconds, preload search components
  setTimeout(() => {
    userHasBeenIdleOnPage = true;
    if (!window.__searchModalPreloaded) {
      preloadSearchModalAssets();
    }
  }, 2000);

  // Track mouse hovering over search elements
  searchElements.forEach((element) => {
    element.addEventListener("mouseenter", () => {
      if (!userHoveredSearchElements && !window.__searchModalPreloaded) {
        userHoveredSearchElements = true;
        preloadSearchModalAssets();
      }
    });
  });

  // Track focus on search inputs as intent
  const searchInputs = document.querySelectorAll('input[type="text"]');
  searchInputs.forEach((input) => {
    input.addEventListener("focus", () => {
      if (!window.__searchModalPreloaded) {
        preloadSearchModalAssets();
      }
    });
  });
};

// Preload assets needed for search modal
const preloadSearchModalAssets = () => {
  // Mark that we've preloaded to avoid duplicate work
  window.__searchModalPreloaded = true;

  console.log("🔍 Preloading search modal assets...");

  // Preload CSS
  const styles = [
    "/styles/search-modal.css",
    "/styles/search-history-items.css",
    "/styles/performance-optimizations.css",
  ];

  styles.forEach((href) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "style";
    link.href = href;
    document.head.appendChild(link);
  });

  // Preload JS
  const script = document.createElement("link");
  script.rel = "preload";
  script.as = "script";
  script.href = "/search-modal-enhanced.js";
  document.head.appendChild(script);

  // Add the prepare-modal class to body to start initializing
  document.body.classList.add("prepare-modal");

  // Prefetch API endpoints if applicable
  const prefetch = document.createElement("link");
  prefetch.rel = "prefetch";
  prefetch.href = "/api/knowledge/recent";
  document.head.appendChild(prefetch);

  // Prime browser cache with a tiny request
  fetch("/api/status", { method: "HEAD", credentials: "same-origin" }).catch(
    () => {}
  );
};

// Initialize when document is ready
document.addEventListener("DOMContentLoaded", () => {
  // Set up passive scroll listeners for better performance
  window.addEventListener("scroll", () => {}, { passive: true });

  // Begin tracking user intent
  trackUserIntent();
});

// Add to window object
window.__searchModalPreloaded = false;
