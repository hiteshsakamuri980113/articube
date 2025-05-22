import React, { useState, useEffect } from "react";
import { useRouteError, Link } from "react-router-dom";
import ErrorMessage from "./ErrorMessage";
import "../../styles/glassmorphism.css";
import "../../styles/siri-text.css";
import "../../styles/common-pages.css";

/**
 * A fallback component to display when a route encounters an error
 * Used with React Router's errorElement prop
 * Updated with glassmorphism design
 */
const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError();

  // State for subtle animated background elements - matching landing page
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
    // Generate background elements
    const elements = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      size: Math.random() * 400 + 200, // Larger size for more visible elements
      x: Math.random() * 100,
      y: Math.random() * 100,
      opacity: Math.random() * 0.06 + 0.02, // Slightly increased opacity
      delay: Math.random() * 5,
    }));
    setBackgroundElements(elements);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden deep-space-bg">
      {/* Subtle background elements - matching landing page style */}
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
                    element.opacity * 1.2
                  }) 0%, rgba(40, 40, 40, ${element.opacity * 0.7}) 100%)`
                : element.id % 2 === 0
                ? `radial-gradient(circle, rgba(90, 158, 255, ${
                    element.opacity * 1.2
                  }) 0%, rgba(20, 20, 20, ${element.opacity * 0.7}) 100%)`
                : `radial-gradient(circle, rgba(80, 80, 80, ${
                    element.opacity * 1.5
                  }) 0%, rgba(10, 10, 10, ${element.opacity * 0.5}) 100%)`,
            filter: "blur(60px)",
            animationDelay: `${element.delay}s`,
            animation: "subtle-pulse 15s ease-in-out infinite",
          }}
        />
      ))}

      {/* Navigation - fixed at the top with glass effect - matching landing page */}
      <div className="navbar-container navbar-glass">
        <div className="app-container h-full mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="block">
              <div className="app-logo text-4xl lg:text-5xl font-bold tracking-tight">
                ArtiCube
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="main-content flex justify-center items-center">
        <div className="app-container py-12">
          <div className="auth-form-container">
            <div className="glass glass-card p-8 md:p-10 rounded-2xl w-full text-center">
              <div className="mb-6">
                <div
                  className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6"
                  style={{ background: "rgba(255, 70, 70, 0.1)" }}
                >
                  <div className="text-4xl">⚠️</div>
                </div>

                <h2 className="text-3xl font-bold mb-4 siri-heading">
                  Navigation Error
                </h2>

                <div className="mb-6">
                  <ErrorMessage error={error} className="siri-text-subtle" />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="/">
                    <button className="glass-button px-6 py-3">
                      Go to home
                    </button>
                  </a>

                  <button
                    onClick={() => window.location.reload()}
                    className="glass-auth-button px-6 py-3"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - matching landing page */}
        <footer className="glass-footer py-8 absolute bottom-0 w-full">
          <div className="app-container">
            <div className="text-center siri-text-subtle text-sm">
              <p className="flex items-center justify-center">
                © {new Date().getFullYear()} Made with
                <span className="heart-icon mx-2">❤</span> by hitesh
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default RouteErrorBoundary;
