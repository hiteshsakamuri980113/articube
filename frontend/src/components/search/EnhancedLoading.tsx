import React, { useEffect, useState } from "react";
import "../../styles/search-modal.css";
import "../../styles/performance-optimizations.css";

interface EnhancedLoadingProps {
  message?: string;
  type?: "search" | "content" | "quick";
  showPlaceholder?: boolean;
}

/**
 * An enhanced loading component with smooth animations and placeholder content
 * for improved perceived performance during search operations
 */
const EnhancedLoading: React.FC<EnhancedLoadingProps> = ({
  message = "Searching for information",
  type = "search",
  showPlaceholder = true,
}) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [animationPhase, setAnimationPhase] = useState(1);

  // Simulate loading progress for better UX
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (type !== "quick") {
      // Create a non-linear loading progress that appears to speed up then slow down
      interval = setInterval(() => {
        setLoadingProgress((prevProgress) => {
          if (prevProgress < 90) {
            const increment = Math.max(
              0.5,
              10 * Math.sin((prevProgress / 180) * Math.PI)
            );
            return Math.min(90, prevProgress + increment);
          }
          return prevProgress;
        });
      }, 150);
    } else {
      setLoadingProgress(80); // Quick loading starts at high percentage
    }

    // Multiple phases of animation for more engaging loading
    const animationTimer = setTimeout(() => {
      setAnimationPhase(2);
    }, 1500);

    return () => {
      if (interval) clearInterval(interval);
      clearTimeout(animationTimer);
    };
  }, [type]);

  // Render different loading placeholders based on type
  const renderPlaceholder = () => {
    if (!showPlaceholder) return null;

    switch (type) {
      case "content":
        return (
          <div className="search-result-placeholder">
            <div className="result-placeholder-header content-placeholder"></div>
            <div className="result-placeholder-paragraph">
              <div className="content-placeholder"></div>
              <div
                className="content-placeholder"
                style={{ width: "90%" }}
              ></div>
              <div
                className="content-placeholder"
                style={{ width: "85%" }}
              ></div>
            </div>
            <div className="result-placeholder-paragraph">
              <div className="content-placeholder"></div>
              <div
                className="content-placeholder"
                style={{ width: "70%" }}
              ></div>
              <div
                className="content-placeholder"
                style={{ width: "95%" }}
              ></div>
            </div>
          </div>
        );
      case "search":
      default:
        return (
          <div className="search-result-placeholder">
            <div className="result-placeholder-header content-placeholder"></div>
            <div className="result-placeholder-paragraph">
              <div className="content-placeholder"></div>
              <div
                className="content-placeholder"
                style={{ width: "90%" }}
              ></div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="enhanced-loading-container hardware-accelerated">
      <div className="loading-animation-container">
        <div className={`search-loading-spinner phase-${animationPhase}`}>
          <div className="loading-pulse"></div>
          <div className="loading-circle"></div>
        </div>
      </div>

      <div className="loading-text">
        <span className="text-gradient animate-shimmer">{message}</span>
        <span className="loading-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </span>

        {type !== "quick" && (
          <div className="loading-progress-container">
            <div
              className="loading-progress-bar"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
        )}
      </div>

      {showPlaceholder && renderPlaceholder()}
    </div>
  );
};

export default EnhancedLoading;
