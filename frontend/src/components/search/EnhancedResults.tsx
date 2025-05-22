import React, { useEffect, useRef } from "react";
import { applyStaggeredAnimation } from "../../utils/performanceUtils";
import "../../styles/search-modal.css";
import "../../styles/performance-optimizations.css";

interface SearchResult {
  response: string;
  sources?: Array<{
    title: string;
    link: string;
    snippet: string;
  }>;
}

interface EnhancedResultsProps {
  result: SearchResult;
}

/**
 * Enhanced results component with performance optimizations and smooth animations
 * for better user experience when displaying search results
 */
const EnhancedResults: React.FC<EnhancedResultsProps> = ({ result }) => {
  const resultContentRef = useRef<HTMLDivElement>(null);

  // Apply optimizations and animations when the result content changes
  useEffect(() => {
    if (!resultContentRef.current) return;

    // Start timing the render process
    const renderStart = performance.now();

    // Apply GPU acceleration to the container
    resultContentRef.current.classList.add(
      "hardware-accelerated",
      "optimize-scrolling-with-fade"
    );

    // Find all paragraphs for staggered animation
    const paragraphs = resultContentRef.current.querySelectorAll("p");
    if (paragraphs.length > 0) {
      const paragraphElements = Array.from(paragraphs).map(
        (p) => p as HTMLElement
      );
      applyStaggeredAnimation(paragraphElements, 50, 30);
    }

    // Process headings for scroll snap points
    const headings = resultContentRef.current.querySelectorAll(
      "h1, h2, h3, h4, h5, h6"
    );
    headings.forEach((heading) => {
      if (heading instanceof HTMLElement) {
        heading.classList.add("scroll-snap-item");
      }
    });

    // Apply optimized transitions for images if any
    const images = resultContentRef.current.querySelectorAll("img");
    images.forEach((img) => {
      img.classList.add("optimize-transitions");
      img.loading = "lazy"; // Enable lazy loading for images

      // Add loading animation effect
      img.style.opacity = "0";
      img.onload = () => {
        window.requestAnimationFrame(() => {
          img.style.transition = "opacity 0.3s ease-out";
          img.style.opacity = "1";
        });
      };
    });

    // Log performance
    const renderTime = performance.now() - renderStart;
    console.log(`⚡ Result content rendered in ${renderTime.toFixed(2)}ms`);
  }, [result]);

  // Sources are now handled in the sidebar, no animation needed here

  // Format HTML content with proper syntax highlighting and optimized rendering
  const formatContent = () => {
    // Add line breaks and ensure content is sanitized
    const formattedContent = result.response.replace(/\n/g, "<br/>");

    return { __html: formattedContent };
  };

  return (
    <div className="search-result-container hardware-accelerated">
      <div className="search-result-header">
        <h3>Results</h3>
      </div>

      <div
        ref={resultContentRef}
        className="search-result-content optimize-scrolling stagger-container"
      >
        <div
          className="result-response"
          dangerouslySetInnerHTML={formatContent()}
        />
      </div>
    </div>
  );
};

export default EnhancedResults;
