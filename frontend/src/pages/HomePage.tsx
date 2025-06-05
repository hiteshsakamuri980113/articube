import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { setCurrentView } from "../store/slices/uiSlice";
import ErrorBoundary from "../components/common/ErrorBoundary";
import SearchModal from "../components/search/SearchModal";
import { prepForModalDisplay, preloadModal } from "../utils/performanceUtils";
import {
  startTiming,
  endTiming,
  logPerformance,
} from "../utils/performanceMonitoring";
import { fetchSearchHistory } from "../services/api";
import "../styles/glassmorphism.css";
import "../styles/siri-text.css";
import "../styles/common-pages.css";
import "../styles/text-utilities.css";
import "../styles/search-modal.css";
import "../styles/section-spacing.css";
import "../styles/performance-optimizations.css";
import "../styles/recent-searches.css";

/**
 * Home page component - the main dashboard with glassmorphism design
 */
const HomePage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: any) => state.auth);

  // State for search modal
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // State for subtle animated background elements
  const [backgroundElements, setBackgroundElements] = useState<
    Array<{
      id: number;
      size: number;
      x: number;
      y: number;
      opacity: number;
      delay: number;
    }>
  >([]);

  useEffect(() => {
    // Set current view
    dispatch(setCurrentView("home"));

    // Generate more subtle background elements
    const elements = Array.from({ length: 4 }, (_, i) => ({
      id: i,
      size: Math.random() * 450 + 250, // Larger, softer elements
      x: Math.random() * 100,
      y: Math.random() * 100,
      opacity: Math.random() * 0.025 + 0.005, // Further reduced opacity for ultra-subtle effect
      delay: Math.random() * 8,
    }));
    setBackgroundElements(elements);

    // Check if the current location is the search page
    const currentPath = window.location.pathname;
    if (currentPath.includes("/app/search")) {
      setIsSearchModalOpen(true);
    }

    // Get search params from URL if any
    const searchParams = new URLSearchParams(window.location.search);
    const queryParam = searchParams.get("q");
    const openSearchParam = searchParams.get("openSearch");

    if (queryParam) {
      setSearchQuery(queryParam);
      setIsSearchModalOpen(true);
    } else if (openSearchParam === "true") {
      setIsSearchModalOpen(true);
    }

    // Load recent searches from database
    const loadRecentSearches = async () => {
      try {
        const history = await fetchSearchHistory(4);
        if (history && history.length > 0) {
          // Extract the query text from each history item
          const searchQueries = history.map((item: any) => item.query);
          setRecentSearches(searchQueries);
        }
      } catch (error) {
        console.error("Error loading recent searches:", error);
      }
    };

    loadRecentSearches();
  }, [dispatch]);

  // Preload modal data when the component mounts
  useEffect(() => {
    // Start performance monitoring
    const timerId = startTiming("HomePage");

    // Preload modal data
    preloadModal();

    // Stop performance monitoring
    return () => {
      const duration = endTiming(timerId);
      if (duration) {
        logPerformance(timerId, "HomePage initial load");
      }
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen relative overflow-hidden">
        {/* Subtle background elements */}
        {backgroundElements.map((element) => (
          <div
            key={element.id}
            className="absolute rounded-full"
            style={{
              width: `${element.size}px`,
              height: `${element.size}px`,
              left: `${element.x}%`,
              top: `${element.y}%`,
              background:
                element.id % 3 === 0
                  ? `radial-gradient(circle, rgba(156, 90, 255, ${
                      element.opacity * 1.0
                    }) 0%, rgba(40, 40, 40, ${element.opacity * 0.5}) 100%)`
                  : element.id % 2 === 0
                  ? `radial-gradient(circle, rgba(90, 158, 255, ${
                      element.opacity * 1.0
                    }) 0%, rgba(20, 20, 20, ${element.opacity * 0.5}) 100%)`
                  : `radial-gradient(circle, rgba(80, 80, 80, ${
                      element.opacity * 1.2
                    }) 0%, rgba(10, 10, 10, ${element.opacity * 0.4}) 100%)`,
              filter: "blur(80px)",
              /* More subtle animation */
              animationDelay: `${element.delay}s`,
              animation: "subtle-pulse 25s ease-in-out infinite",
            }}
          />
        ))}

        {/* Search Modal */}
        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          initialQuery={searchQuery}
        />

        {/* Main content container with proper spacing */}
        <main className="main-content">
          <div className="app-container">
            {/* Welcome section */}
            <section className="mb-16 mt-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 siri-heading text-gradient">
                Welcome back, <span>{user?.username || "User"}!</span>
              </h1>
              <p className="text-lg siri-text-subtle leading-relaxed max-w-3xl">
                Access accurate, reliable information from trusted sources.
                Build your personal knowledge library with ArtiCube.
              </p>
            </section>

            {/* Centered search section with search button below input field */}
            <section className="flex justify-center items-center mt-16 mb-16">
              <div className="glass glass-card p-8 rounded-2xl max-w-3xl w-full">
                <h2 className="text-2xl font-semibold mb-6 siri-heading text-gradient section-title w-fit">
                  What would you like to know?
                </h2>
                <div className="w-full">
                  <div className="relative w-full">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[rgba(255,255,255,0.5)]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Ask a question or search for a topic..."
                      className="auth-form-input pl-12 w-full focus:border-[rgba(156,90,255,0.25)] transition-all pr-4 bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] h-12 rounded-xl"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && searchQuery.trim()) {
                          // Track performance timing for modal opening
                          const timerId = startTiming(
                            "modal-open-from-keyboard"
                          );

                          // Use the performance utility for modal preparation
                          prepForModalDisplay();

                          // Update recent searches in local state
                          if (searchQuery.trim()) {
                            setRecentSearches((prev) => {
                              // Remove the search if it already exists
                              const filtered = prev.filter(
                                (item) => item !== searchQuery.trim()
                              );
                              // Add new search to beginning and limit to 4 items
                              return [searchQuery.trim(), ...filtered].slice(
                                0,
                                4
                              );
                            });
                          }

                          // Better animation timing with double requestAnimationFrame
                          window.requestAnimationFrame(() => {
                            window.requestAnimationFrame(() => {
                              setIsSearchModalOpen(true);

                              // Log performance after a short delay to ensure modal is visible
                              setTimeout(() => {
                                const duration = endTiming(timerId);
                                if (duration) {
                                  logPerformance(
                                    timerId,
                                    `Modal opened in ${duration.toFixed(2)}ms`
                                  );
                                }
                              }, 300);
                            });
                          });
                        }
                      }}
                    />
                  </div>
                  <div style={{ height: "1.5rem" }}></div>{" "}
                  {/* Spacer div to create gap */}
                  <button
                    className="simple-button primary-button rounded-xl flex items-center justify-center gap-2 text-sm h-12 px-8"
                    onClick={() => {
                      // Use the performance utility for modal preparation
                      if (searchQuery.trim()) {
                        // Track performance timing for modal opening
                        const timerId = startTiming("modal-open-from-button");

                        // Use enhanced modal preparation flow
                        prepForModalDisplay();

                        // Update recent searches in local state
                        if (searchQuery.trim()) {
                          setRecentSearches((prev) => {
                            // Remove the search if it already exists
                            const filtered = prev.filter(
                              (item) => item !== searchQuery.trim()
                            );
                            // Add new search to beginning and limit to 4 items
                            return [searchQuery.trim(), ...filtered].slice(
                              0,
                              4
                            );
                          });
                        }

                        // Optimized animation timing with double requestAnimationFrame
                        window.requestAnimationFrame(() => {
                          document.body.classList.add("optimize-transitions");

                          window.requestAnimationFrame(() => {
                            // Make sure we reset the previous query ref to force a new search
                            setIsSearchModalOpen(true);

                            // Log performance after modal is visible
                            setTimeout(() => {
                              const duration = endTiming(timerId);
                              if (duration) {
                                logPerformance(
                                  timerId,
                                  `Modal opened in ${duration.toFixed(2)}ms`
                                );
                              }
                            }, 300);
                          });
                        });
                      }
                    }}
                  >
                    Search
                  </button>
                </div>
              </div>
            </section>

            {/* Section divider */}
            <div className="section-divider"></div>

            {/* Recent Searches section */}
            <section className="recent-searches-container mb-16">
              <h2 className="text-2xl font-semibold mb-6 siri-heading text-gradient section-title">
                Recent Searches
              </h2>
              <div className="max-w-3xl w-full mx-auto">
                {recentSearches.length > 0 ? (
                  <div className="search-items-container">
                    {recentSearches.map((search, index) => (
                      <div
                        key={index}
                        className="search-item w-fit"
                        onClick={() => {
                          setSearchQuery(search);
                          setIsSearchModalOpen(true);
                        }}
                      >
                        <div className="search-item-content">
                          <span className="search-icon">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                              />
                            </svg>
                          </span>
                          <span className="search-text">{search}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <p className="text-[rgba(255,255,255,0.7)] mb-2">
                      No recent searches yet
                    </p>
                    <p className="text-sm text-[rgba(255,255,255,0.5)]">
                      Your search history will appear here for quick access
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default HomePage;
