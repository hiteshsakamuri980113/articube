/**
 * Optimizes UI transitions for smoother experiences
 * @param element The element to optimize
 */
export const optimizeUITransitions = (element: HTMLElement) => {
  // Force a repaint to ensure smooth animations
  window.requestAnimationFrame(() => {
    element.classList.add("hardware-accelerated");
    // Add additional performance classes for improved rendering
    element.classList.add("promote-layer");

    // Ensure contained rendering for better performance
    element.style.contain = "layout paint style";

    // For best hardware acceleration, add specific transform hint
    element.style.transform = "translateZ(0)";
    element.style.willChange = "transform, opacity";
  });
};

/**
 * Pre-loads modal for smoother opening with enhanced transition performance
 */
export const preloadModal = () => {
  // Add classes to prepare for modal opening
  document.body.classList.add("prepare-modal");

  // Preload transition classes on body
  document.body.classList.add("optimize-transitions");

  // Schedule the actual modal display next frame with double RAF for best timing
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        resolve();
      });
    });
  });
};

/**
 * Optimizes scrolling for an element with advanced techniques
 * @param element The element to optimize scrolling for
 * @param withFade Whether to add fading edges to the scrollable content
 */
export const optimizeScrolling = (element: HTMLElement, withFade = false) => {
  if (withFade) {
    element.classList.add("optimize-scrolling-with-fade");
  } else {
    element.classList.add("optimize-scrolling");
  }

  // Apply best practices for smooth scrolling
  (element.style as any)["-webkit-overflow-scrolling"] = "touch";
  element.style.overscrollBehavior = "contain";

  // Set up passive scroll listener for better performance
  element.addEventListener("scroll", () => {}, { passive: true });

  // Apply GPU acceleration to scrollable content
  element.style.transform = "translateZ(0)";
  element.style.willChange = "scroll-position";

  // Add scroll snap for better touch experience
  if (window.matchMedia("(max-width: 768px)").matches) {
    element.style.scrollSnapType = "y proximity";

    // Find headings and make them snap points
    const headings = element.querySelectorAll("h2, h3, h4");
    headings.forEach((heading) => {
      if (heading instanceof HTMLElement) {
        heading.style.scrollSnapAlign = "start";
      }
    });
  }
};

/**
 * Preps the page for showing a modal by adding optimization classes
 */
export const prepForModalDisplay = () => {
  // Add preparation class to body
  document.body.classList.add("prepare-modal");

  // Add optimization class to main content
  const mainContent = document.querySelector(".app-container");
  if (mainContent instanceof HTMLElement) {
    window.requestAnimationFrame(() => {
      mainContent.classList.add("hardware-accelerated");
    });
  }

  // Preload key image assets that might be used in the modal
  const preloadAssets = [
    "/assets/search-bg.png",
    "/assets/result-placeholder.svg",
  ];

  preloadAssets.forEach((asset) => {
    const img = new Image();
    img.src = asset;
  });

  // Prime browser cache with a tiny API request if needed
  fetch("/api/status", {
    method: "HEAD",
    credentials: "same-origin",
    cache: "force-cache",
  }).catch(() => {});
};

/**
 * Applies staggered appearance animation to a list of elements
 * @param elements Array of elements to animate with staggered timing
 * @param baseDelay Base delay in ms before animations start
 * @param staggerDelay Delay between each element in ms
 */
export const applyStaggeredAnimation = (
  elements: HTMLElement[],
  baseDelay = 50,
  staggerDelay = 30
): void => {
  elements.forEach((element, index) => {
    // Calculate delay for this element
    const delay = baseDelay + index * staggerDelay;

    // Apply transition properties
    element.style.opacity = "0";
    element.style.transform = "translateY(10px)";
    element.style.transition =
      "opacity 0.25s ease-out, transform 0.25s ease-out";
    element.style.transitionDelay = `${delay}ms`;

    // Force browser to acknowledge these styles before changing them
    void element.offsetWidth;

    // Schedule the animation with RAF for smoother results
    window.requestAnimationFrame(() => {
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
    });
  });
};
