import React, { useState, useEffect, useRef } from "react";
import "../styles/search-modal.css";
import "../styles/performance-optimizations.css";

interface SearchResultItem {
  id: string;
  title: string;
  snippet: string;
  category?: string;
  url?: string;
}

interface VirtualizedSearchResultsProps {
  results: SearchResultItem[];
  isLoading: boolean;
  containerClassName?: string;
  onResultClick?: (result: SearchResultItem) => void;
}

/**
 * A component that efficiently renders large search result sets using virtualization
 */
const VirtualizedSearchResults: React.FC<VirtualizedSearchResultsProps> = ({
  results,
  isLoading,
  containerClassName = "",
  onResultClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<SearchResultItem[]>([]);
  const [containerHeight, setContainerHeight] = useState(0);

  // Calculate item height based on first item (approximation)
  const ITEM_HEIGHT = 80; // pixels, approximate height of each item
  const BUFFER_ITEMS = 5; // number of items to render above/below visible area

  // Update visible items when scrolling or on results change
  useEffect(() => {
    if (!containerRef.current) return;

    // Set initial container height
    setContainerHeight(containerRef.current.clientHeight);

    const handleScroll = () => {
      const { scrollTop, clientHeight } = containerRef.current!;

      // Calculate visible range with buffer
      const startIndex = Math.max(
        0,
        Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_ITEMS
      );

      const endIndex = Math.min(
        results.length - 1,
        Math.ceil((scrollTop + clientHeight) / ITEM_HEIGHT) + BUFFER_ITEMS
      );

      // Update visible items
      setVisibleItems(results.slice(startIndex, endIndex + 1));
    };

    // Initial calculation
    handleScroll();

    // Add scroll listener
    containerRef.current.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, [results]);

  if (isLoading) {
    return (
      <div className="virtualized-search-loading">
        <div className="loading-pulse"></div>
        <p>Loading results...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="virtualized-search-empty">
        <div className="empty-icon">🔍</div>
        <p>No results found</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`virtualized-results-container optimize-scrolling-with-fade ${containerClassName}`}
      style={{ height: "100%", overflowY: "auto" }}
    >
      {/* Container with full scroll height */}
      <div
        className="virtualized-content"
        style={{
          height: `${results.length * ITEM_HEIGHT}px`,
          position: "relative",
        }}
      >
        {/* Only render visible items */}
        {visibleItems.map((result, index) => (
          <div
            key={result.id}
            className="virtual-item search-result-item glass-shine hardware-accelerated"
            style={{
              position: "absolute",
              top: `${results.indexOf(result) * ITEM_HEIGHT}px`,
              left: 0,
              width: "100%",
              height: `${ITEM_HEIGHT}px`,
            }}
            onClick={() => onResultClick && onResultClick(result)}
          >
            <div className="result-content">
              <h4 className="result-title">{result.title}</h4>
              <p className="result-snippet">{result.snippet}</p>
              {result.category && (
                <span className="result-category">{result.category}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualizedSearchResults;
