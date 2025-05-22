/**
 * Virtualized list utilities for efficiently rendering large datasets
 * This module provides functions for virtualizing large lists to improve performance
 */

interface VirtualListOptions {
  itemHeight: number; // Height of each item in pixels
  overscan?: number; // Number of items to render beyond visible area
  containerHeight?: number; // Fixed height of the container (optional)
}

interface VirtualListResult {
  startIndex: number; // First visible item index
  endIndex: number; // Last visible item index
  virtualPadding: number; // Padding to preserve scroll height
  scrollTop: number; // Current scroll position
  visibleCount: number; // Number of visible items
}

/**
 * Calculate which items should be rendered in a virtualized list
 *
 * @param scrollTop Current scroll position
 * @param totalCount Total number of items in the list
 * @param options Configuration options
 * @returns Information about which items to render
 */
export const calculateVirtualListIndices = (
  scrollTop: number,
  totalCount: number,
  options: VirtualListOptions
): VirtualListResult => {
  const { itemHeight, overscan = 3, containerHeight } = options;

  // Calculate visible area
  const actualContainerHeight = containerHeight || window.innerHeight;

  // Calculate indices
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount =
    Math.ceil(actualContainerHeight / itemHeight) + 2 * overscan;
  const endIndex = Math.min(totalCount - 1, startIndex + visibleCount);

  // Calculate padding to preserve scroll height
  const virtualPadding = totalCount * itemHeight;

  return {
    startIndex,
    endIndex,
    virtualPadding,
    scrollTop,
    visibleCount,
  };
};

/**
 * Hook up a virtualized list to a scrollable container
 *
 * @param container The scrollable container element
 * @param totalItems Total number of items
 * @param renderCallback Callback to render visible items
 * @param options Virtualization options
 * @returns Cleanup function
 */
export const setupVirtualizedList = (
  container: HTMLElement,
  totalItems: number,
  renderCallback: (result: VirtualListResult) => void,
  options: VirtualListOptions
): (() => void) => {
  // Initial calculation
  let currentResult = calculateVirtualListIndices(
    container.scrollTop,
    totalItems,
    options
  );
  renderCallback(currentResult);

  // Set up scroll handler with throttling for performance
  let ticking = false;
  const scrollHandler = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        currentResult = calculateVirtualListIndices(
          container.scrollTop,
          totalItems,
          options
        );
        renderCallback(currentResult);
        ticking = false;
      });
      ticking = true;
    }
  };

  // Add scroll listener
  container.addEventListener("scroll", scrollHandler, { passive: true });

  // Return cleanup function
  return () => {
    container.removeEventListener("scroll", scrollHandler);
  };
};

/**
 * Get styles for a virtualized container
 *
 * @param virtualPadding Total height needed for scrolling
 * @returns CSS style object
 */
export const getVirtualContainerStyle = (
  virtualPadding: number
): React.CSSProperties => {
  return {
    position: "relative",
    height: `${virtualPadding}px`,
    width: "100%",
  };
};

/**
 * Get styles for a virtualized item
 *
 * @param index Item index
 * @param itemHeight Height of each item
 * @returns CSS style object
 */
export const getVirtualItemStyle = (
  index: number,
  itemHeight: number
): React.CSSProperties => {
  return {
    position: "absolute",
    top: `${index * itemHeight}px`,
    left: 0,
    width: "100%",
    height: `${itemHeight}px`,
  };
};
