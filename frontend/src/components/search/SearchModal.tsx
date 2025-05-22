import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { useNotification } from "../../hooks/useNotification";
import {
  fetchInformation,
  fetchQueryHistory,
  setCurrentQuery,
  clearCurrentResult,
} from "../../store/slices/knowledgeSlice";
import {
  optimizeScrolling,
  optimizeUITransitions,
} from "../../utils/performanceUtils";
import {
  startTiming,
  endTiming,
  logPerformance,
} from "../../utils/performanceMonitoring";
import EnhancedLoading from "./EnhancedLoading";
import EnhancedResults from "./EnhancedResults";
import "../../styles/search-modal.css";
import "../../styles/search-history-items.css";
import "../../styles/animations.css";
import "../../styles/enhanced-components.css";
import "../../styles/performance-optimizations.css"; // Import performance optimizations
import "../../styles/history-icon.css"; // Import history icon styles

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  initialQuery = "",
}) => {
  const dispatch = useAppDispatch();
  const { currentResult, isLoading, history } = useAppSelector(
    (state: any) => state.knowledge
  );
  const { showError, showInfo } = useNotification();

  const [query, setQuery] = useState(initialQuery);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [animationActive, setAnimationActive] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // previousQuery ref to track query changes and prevent duplicate searches
  const previousQueryRef = useRef<string>("");

  // Handle search initialization when modal opens or initialQuery changes
  useEffect(() => {
    if (isOpen) {
      // Always update the input field with the latest initialQuery
      setQuery(initialQuery);

      // Always initiate a search when modal opens with an initialQuery
      if (initialQuery && initialQuery.trim()) {
        // Mark that we're in searching mode when coming from home page
        setHasSearched(true);

        // Execute search if query is different from previous or if modal was just opened
        if (previousQueryRef.current !== initialQuery) {
          console.log("checking....");
          // Update the previous query reference
          previousQueryRef.current = initialQuery;

          // Small timeout to allow UI to update first
          const timer = setTimeout(() => {
            console.log("Executing search for:", initialQuery);
            dispatch(setCurrentQuery(initialQuery));
            dispatch(fetchInformation({ query: initialQuery }));
          }, 150);

          return () => clearTimeout(timer);
        }
      }
    } else {
      // Reset state when modal closes
      previousQueryRef.current = "";
      setHistoryExpanded(false);
      setHasSearched(false);
    }
  }, [isOpen, initialQuery, dispatch]);

  // Focus the input when modal opens, prevent background scrolling, and dim background elements
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Pre-load the modal content before showing it
      document.body.classList.add("prepare-modal");

      // Focus the search input with reduced timeout for faster response
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50); // Reduced from 100ms for faster focus

      // Prevent background scrolling when modal is open
      document.body.style.overflow = "hidden";

      // Add classes to the body to dim and blur background elements
      document.body.classList.add("modal-open");

      // Force a browser repaint to ensure smooth animations
      window.requestAnimationFrame(() => {
        document.body.classList.add("modal-active");
      });
    } else {
      // Re-enable scrolling when modal is closed
      document.body.style.overflow = "";

      // Remove the dimming classes when modal closes
      document.body.classList.remove("modal-open");
      document.body.classList.remove("modal-active");
      document.body.classList.remove("prepare-modal");
    }

    // Clean up function to ensure scrolling is re-enabled if component unmounts
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("modal-open");
      document.body.classList.remove("modal-active");
      document.body.classList.remove("prepare-modal");
    };
  }, [isOpen]);

  // Fetch search history when modal opens
  useEffect(() => {
    if (isOpen) {
      // Fetch the most recent 10 searches
      dispatch(fetchQueryHistory(10))
        .unwrap()
        .catch((error) => {
          showError(error || "Failed to load search history", "History Error");
          console.error("Error fetching search history:", error);
        });
    }
  }, [isOpen, dispatch, showError]);

  // Apply scrolling optimizations to key elements after render
  useEffect(() => {
    if (isOpen) {
      const modalContent = document.querySelector(".search-modal-content");
      if (modalContent instanceof HTMLElement) {
        optimizeScrolling(modalContent);
      }

      const resultsContent = document.querySelector(".search-result-content");
      if (resultsContent instanceof HTMLElement) {
        optimizeScrolling(resultsContent);
      }

      const sidebarContent = document.querySelectorAll(".sidebar-content");
      sidebarContent.forEach((element) => {
        if (element instanceof HTMLElement) {
          optimizeScrolling(element);
        }
      });
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  // Handle click outside to close modal or history dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close modal when clicking outside
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        onClose();
      }

      // Close history dropdown when clicking outside
      if (historyExpanded) {
        const historyContainer = document.querySelector(
          ".history-icon-container"
        );
        if (
          historyContainer &&
          !historyContainer.contains(event.target as Node)
        ) {
          setHistoryExpanded(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, historyExpanded, setHistoryExpanded]);

  // Clear results when modal closes
  useEffect(() => {
    if (!isOpen) {
      dispatch(clearCurrentResult());
    }
  }, [isOpen, dispatch]);

  // Add effect for performance monitoring when modal opens or closes
  useEffect(() => {
    let perfTimerId: string | undefined;
    if (isOpen) {
      // Start performance measurement
      perfTimerId = startTiming("modal-open-to-render");

      // Apply hardware acceleration to modal for smoother animations
      if (modalRef.current) {
        optimizeUITransitions(modalRef.current);
      }

      // Initialize search modal optimizations from external script
      const script = document.createElement("script");
      script.src = "/search-modal-enhanced.js";
      script.async = true;
      script.onload = () => {
        // Call the globally exposed initialization function
        if (typeof window.initSearchModalOptimizations === "function") {
          window.initSearchModalOptimizations();
        }
      };
      document.body.appendChild(script);

      // End performance measurement after a short delay
      setTimeout(() => {
        if (perfTimerId) {
          endTiming(perfTimerId);
          logPerformance(perfTimerId, "Modal open to fully rendered");
        }
      }, 500);
    }

    return () => {
      // Clean up script if needed
      const scriptElement = document.querySelector(
        'script[src="/search-modal-enhanced.js"]'
      );
      if (scriptElement) {
        scriptElement.remove();
      }
    };
  }, [isOpen]);

  // Add callback for virtualizing large result sets
  const handleOptimizeResults = useCallback(() => {
    const resultsContainer = document.querySelector(".search-result-content");
    if (!resultsContainer || !(resultsContainer instanceof HTMLElement)) return;

    // Add advanced scrolling optimizations
    resultsContainer.classList.add("optimize-scrolling-with-fade");

    // Add staggered animations for smooth appearance
    const resultItems = resultsContainer.querySelectorAll("p, li, h3");
    resultItems.forEach((item, index) => {
      if (item instanceof HTMLElement) {
        item.classList.add("stagger-item");
        item.style.transitionDelay = `${index * 20}ms`;
      }
    });

    // Trigger staggered animation
    setTimeout(() => {
      resultsContainer.classList.add("stagger-container");
      resultsContainer.classList.add("ready");
    }, 50);

    // Add scroll-snap for improved touch experience
    resultsContainer.classList.add("scroll-snap-container");
    const headings = resultsContainer.querySelectorAll("h3");
    headings.forEach((heading) => {
      if (heading instanceof HTMLElement) {
        heading.classList.add("scroll-snap-item");
      }
    });
  }, []);

  // Apply result optimizations when results change
  useEffect(() => {
    if (currentResult && !isLoading) {
      const timerId = setTimeout(() => {
        handleOptimizeResults();
      }, 100); // Short delay to ensure DOM is ready
      return () => clearTimeout(timerId);
    }
  }, [currentResult, isLoading, handleOptimizeResults]);

  // Add a scroll indicator component for better UX with scrollable content
  const ScrollIndicator = useCallback(() => {
    const [showIndicator, setShowIndicator] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const handleScroll = () => {
        if (!scrollContainerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } =
          scrollContainerRef.current;
        // Show indicator when more than 100px of content is below viewport
        setShowIndicator(scrollTop < scrollHeight - clientHeight - 100);
      };

      // Find the scroll container
      const scrollContainer = document.querySelector(".search-result-content");
      if (scrollContainer instanceof HTMLDivElement) {
        scrollContainerRef.current = scrollContainer;
        scrollContainer.addEventListener("scroll", handleScroll, {
          passive: true,
        });

        // Initial check
        handleScroll();
      }

      return () => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.removeEventListener(
            "scroll",
            handleScroll
          );
        }
      };
    }, [currentResult]);

    const scrollDown = () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({
          top: 300,
          behavior: "smooth",
        });
      }
    };

    if (!showIndicator) return null;

    return (
      <div className={`scroll-indicator visible`} onClick={scrollDown}>
        <div className="scroll-indicator-arrow"></div>
      </div>
    );
  }, [currentResult]);

  // Memoized handler for refreshing history to prevent unnecessary re-renders
  const handleRefreshHistory = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      // Use a reference to track if component is mounted
      let isMounted = true;

      // Set a loading state locally without re-rendering the whole component
      const button = e.currentTarget as HTMLButtonElement;
      if (button) {
        button.classList.add("refreshing");
        button.disabled = true;
      }

      // Use setTimeout to prevent UI freeze
      setTimeout(() => {
        if (isMounted) {
          dispatch(fetchQueryHistory(10))
            .unwrap()
            .then(() => {
              // Only show notification if successful and component is still mounted
              if (isMounted) {
                showInfo("History refreshed", "Success", { duration: 2000 });
              }
            })
            .catch((error) => {
              if (isMounted) {
                showError(error || "Failed to refresh history", "Error");
              }
            })
            .finally(() => {
              if (button && isMounted) {
                button.classList.remove("refreshing");
                button.disabled = false;
              }
            });
        }
      }, 0);

      // Clean-up function
      return () => {
        isMounted = false;
      };
    },
    [dispatch, showInfo, showError]
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (query.trim()) {
      // Update the previous query reference
      previousQueryRef.current = query;

      // Set hasSearched state to true when a search is initiated
      setHasSearched(true);

      dispatch(setCurrentQuery(query));
      showInfo("Searching for information...", "Knowledge Search");

      try {
        await dispatch(fetchInformation({ query })).unwrap();
        showInfo("Search completed successfully", "Knowledge Search");
      } catch (error) {
        showError(
          "Failed to retrieve information. Please try again.",
          "Search Error"
        );
      }
    }
  };

  const handleHistoryItemClick = (historyItem: string) => {
    setQuery(historyItem);
    // Update the previous query reference
    previousQueryRef.current = historyItem;

    // Set hasSearched state to true
    setHasSearched(true);

    dispatch(setCurrentQuery(historyItem));
    dispatch(fetchInformation({ query: historyItem }));

    // Close history dropdown after selecting an item
    setHistoryExpanded(false);
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay hardware-accelerated">
      <div
        ref={modalRef}
        className="search-modal-container glass-shine hardware-accelerated"
      >
        <div className="search-modal-header">
          <h2>Knowledge Search</h2>
          <button className="search-modal-close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="search-modal-content optimize-scrolling">
          {/* Search form */}
          <form onSubmit={handleSearch} className="search-form">
            <div
              className={`search-input-container ${
                animationActive ? "pulse-focus" : ""
              } hardware-accelerated`}
              onFocus={() => setAnimationActive(true)}
              onBlur={() => setAnimationActive(false)}
            >
              <span className="search-icon">🔍</span>
              <input
                ref={inputRef}
                type="text"
                placeholder="What would you like to know?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="search-buttons">
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="search-button primary"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="loading-dot" />
                    Searching...
                  </span>
                ) : (
                  <span>Search</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => dispatch(clearCurrentResult())}
                disabled={!currentResult}
                className="search-button secondary"
              >
                Clear
              </button>
            </div>
          </form>

          {/* Results section */}
          <div className="search-results-grid hardware-accelerated">
            {/* Main search results */}
            <div className="search-results-main hardware-accelerated optimize-transitions">
              {isLoading ? (
                <EnhancedLoading
                  message="Searching for information"
                  type="search"
                  showPlaceholder={true}
                />
              ) : currentResult ? (
                <>
                  <EnhancedResults result={currentResult} />
                  <ScrollIndicator />
                </>
              ) : (
                <div className="search-empty-state">
                  <div className="search-empty-icon animate-float">🔍</div>
                  <h3>Search for Knowledge</h3>
                  <p>
                    Ask any question or search for a topic to access factual
                    information from ArtiCube's knowledge base
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar with sources */}
            <div className="search-sidebar hardware-accelerated">
              {/* Sources Section */}
              {currentResult &&
                currentResult.sources &&
                currentResult.sources.length > 0 && (
                  <div className="sidebar-section hardware-accelerated sources-section">
                    {" "}
                    <div className="sidebar-header sources-header">
                      <h3>Sources</h3>
                    </div>
                    <div className="sidebar-content animate-fade-in optimize-scrolling">
                      {currentResult.sources.map(
                        (
                          source: {
                            title: string;
                            link: string;
                          },
                          index: number
                        ) => (
                          <div key={index} className="source-item-minimal">
                            <a
                              href={source.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="source-title-minimal"
                            >
                              <span className="source-dot"></span>
                              {source.title}
                            </a>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}{" "}
              {/* Recent Searches Icon */}
              <div className="history-icon-container">
                <div
                  className="history-floating-button"
                  onClick={() => setHistoryExpanded(!historyExpanded)}
                >
                  <span className="history-button-icon">
                    {historyExpanded ? "✕" : "🕒"}
                  </span>
                  {!historyExpanded && (
                    <span className="history-button-text">History</span>
                  )}
                </div>

                {/* Expandable Recent Searches Dropdown */}
                {historyExpanded && (
                  <div className="history-dropdown glass-shine animate-fade-in">
                    <div className="history-dropdown-header">
                      <h3>Recent Searches</h3>
                      <button
                        className="history-refresh-button"
                        onClick={handleRefreshHistory}
                        title="Refresh history"
                      >
                        ↻
                      </button>
                    </div>
                    {isLoading && history.length === 0 ? (
                      <div className="history-loading">
                        <div className="history-loading-spinner"></div>
                        <p>Loading history...</p>
                      </div>
                    ) : history.length > 0 ? (
                      <div className="history-dropdown-content">
                        {history
                          .slice(0, 5)
                          .map(
                            (item: {
                              id: string;
                              query: string;
                              timestamp: string;
                              response: string;
                            }) => (
                              <button
                                key={item.id}
                                onClick={() =>
                                  handleHistoryItemClick(item.query)
                                }
                                className="history-item-compact glass-shine"
                              >
                                <span className="history-icon-small">🔍</span>
                                <p className="history-query-compact">
                                  {item.query}
                                </p>
                                <span className="history-date-compact">
                                  {new Date(
                                    item.timestamp
                                  ).toLocaleDateString()}
                                </span>
                              </button>
                            )
                          )}
                      </div>
                    ) : (
                      <div className="history-empty-compact">
                        <p>No search history yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <ScrollIndicator />
        </div>
      </div>
    </div>
  );
};

export default SearchModal;

// Declare global window interface for TypeScript
declare global {
  interface Window {
    initSearchModalOptimizations?: () => void;
  }
}
