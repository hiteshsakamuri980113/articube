import React, { useState, useEffect } from "react";

interface ReadingProgressBarProps {
  contentId: string;
  savedProgress?: number;
  className?: string;
}

const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({
  contentId,
  savedProgress,
  className = "",
}) => {
  const [progress, setProgress] = useState<number>(savedProgress || 0);

  useEffect(() => {
    // Set initial progress if available
    if (savedProgress && savedProgress > 0) {
      setProgress(savedProgress);
    }

    // Calculate max scroll height for percentage calculations
    const calculateMaxScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
      );
      return documentHeight - windowHeight;
    };

    // Function to update progress on scroll
    const handleScroll = () => {
      const maxScroll = calculateMaxScroll();
      const currentScroll = window.scrollY;

      if (maxScroll > 0) {
        // Calculate progress as percentage
        const newProgress = Math.min(
          Math.round((currentScroll / maxScroll) * 100),
          100
        );
        setProgress(newProgress);
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Initial calculation
    handleScroll();

    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [contentId, savedProgress]);

  return (
    <div
      className={`relative w-full bg-[var(--surface-secondary)] rounded-full h-1 ${className}`}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="absolute top-0 left-0 h-full bg-[var(--accent)] rounded-full transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
      <span className="sr-only">{progress}% read</span>
    </div>
  );
};

export default ReadingProgressBar;
