import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNotification } from "../hooks/useNotification";
import { NotificationType } from "../store/slices/notificationSlice";
import "../styles/glassmorphism.css";
import "../styles/siri-text.css";
import "../styles/common-pages.css";

/**
 * TestPage updated with glassmorphism design
 */
const TestPage: React.FC = () => {
  const { showNotification, showSuccess, showError, showInfo, showWarning } =
    useNotification();

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

      {/* Main content container with proper spacing from navbar */}
      <main className="main-content">
        <div className="app-container py-12">
          <section className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 siri-heading">
              Notification Test Page
            </h1>
            <p className="siri-text-subtle max-w-3xl mx-auto mb-12">
              This page demonstrates various notification types with the new
              glassmorphism design
            </p>
          </section>

          <div className="auth-form-container">
            <div className="glass glass-card p-8 rounded-2xl w-full mb-8">
              <h2 className="text-xl font-semibold mb-6 siri-text">
                Test Notifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() =>
                    showSuccess("Operation completed successfully!", "Success")
                  }
                  className="glass-auth-button w-full"
                >
                  Show Success
                </button>

                <button
                  onClick={() => showError("Something went wrong!", "Error")}
                  className="glass-button w-full"
                  style={{ background: "rgba(255, 70, 70, 0.7)" }}
                >
                  Show Error
                </button>

                <button
                  onClick={() => showInfo("Here is some information.", "Info")}
                  className="glass-button w-full"
                  style={{ background: "rgba(70, 130, 255, 0.7)" }}
                >
                  Show Info
                </button>

                <button
                  onClick={() => showWarning("Be careful!", "Warning")}
                  className="glass-button w-full"
                  style={{ background: "rgba(255, 180, 70, 0.7)" }}
                >
                  Show Warning
                </button>

                <button
                  onClick={() =>
                    showNotification(
                      "This is a custom notification that will stay visible until manually closed.",
                      NotificationType.INFO,
                      "Custom Notification",
                      { autoClose: false }
                    )
                  }
                  className="glass-button w-full"
                >
                  Show Persistent Notification
                </button>

                <button
                  onClick={() =>
                    showNotification(
                      "This notification will close in just 2 seconds!",
                      NotificationType.SUCCESS,
                      "Quick Notification",
                      { duration: 2000 }
                    )
                  }
                  className="glass-button w-full"
                >
                  Show Quick Notification
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link to="/">
              <button className="glass-auth-button">Back to Home</button>
            </Link>
          </div>
        </div>

        {/* Footer - matching landing page */}
        <footer className="glass-footer py-8">
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

export default TestPage;
