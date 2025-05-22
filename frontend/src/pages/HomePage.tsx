import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import "../styles/glassmorphism.css";
import "../styles/siri-text.css";
import "../styles/common-pages.css";
import "../styles/text-utilities.css";
import "../styles/search-modal.css";
import "../styles/section-spacing.css";
import "../styles/performance-optimizations.css";

/**
 * Home page component - the main dashboard with glassmorphism design
 */
const HomePage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: any) => state.auth);

  // State for search modal
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
              <h1 className="text-4xl md:text-5xl font-bold mb-6 siri-heading">
                Welcome back, <span>{user?.username || "User"}</span>
              </h1>
              <p className="text-lg siri-text-subtle leading-relaxed max-w-3xl">
                Access accurate, reliable information from trusted sources.
                Build your personal knowledge library with ArtiCube.
              </p>
            </section>

            {/* Centered search section */}
            <section className="flex justify-center items-center mt-16 mb-16">
              <div className="glass p-8 rounded-2xl max-w-3xl w-full">
                <h2 className="text-xl font-semibold mb-6 siri-heading">
                  What would you like to know?
                </h2>
                <div className="flex items-center gap-4">
                  <div className="relative flex-grow">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[rgba(255,255,255,0.5)]">
                      🔍
                    </span>
                    <input
                      type="text"
                      placeholder="Ask a question or search for a topic..."
                      className="auth-form-input pl-12 w-full focus:border-[rgba(156,90,255,0.2)] transition-all pr-4 bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.06)]"
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

                          // Better animation timing with double requestAnimationFrame
                          // This helps ensure CSS transitions are properly sequenced
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
                  <button
                    className="glass-button glass-button-primary py-2.5 px-6"
                    onClick={() => {
                      // Use the performance utility for modal preparation
                      if (searchQuery.trim()) {
                        // Track performance timing for modal opening
                        const timerId = startTiming("modal-open-from-button");

                        // Use enhanced modal preparation flow
                        prepForModalDisplay();

                        // Optimized animation timing with double requestAnimationFrame
                        // This creates a smoother transition by ensuring CSS is applied first
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

                <div className="flex justify-center mt-6">
                  <Link
                    to="/app/saved"
                    className="text-sm text-[rgba(156,90,255,0.9)] hover:text-[rgba(156,90,255,1)] transition-all"
                  >
                    View your saved items →
                  </Link>
                </div>
              </div>
            </section>

            {/* Placeholder for future content */}
            <div className="h-32"></div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default HomePage;
