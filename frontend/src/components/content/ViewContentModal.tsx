import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAppSelector } from "../../hooks/reduxHooks";
import {
  optimizeScrolling,
  optimizeUITransitions,
} from "../../utils/performanceUtils";
import { startTiming, endTiming } from "../../utils/performanceMonitoring";
import "../../styles/view-content-modal.css";
import "../../styles/animations.css";
import "../../styles/enhanced-components.css";
import "../../styles/performance-optimizations.css";

interface ViewContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
}

interface ContentSource {
  title: string;
  link?: string;
}

const ViewContentModal: React.FC<ViewContentModalProps> = ({
  isOpen,
  onClose,
  contentId,
}) => {
  const { savedItems } = useAppSelector((state) => state.savedItems);
  const [content, setContent] = useState<{
    id: string;
    title: string;
    content: string;
    sources: ContentSource[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [animationActive, setAnimationActive] = useState(false);

  // Function to fetch content from Redux store
  const fetchContent = useCallback(() => {
    if (!contentId) return;

    setIsLoading(true);
    startTiming("fetchSavedContent");

    try {
      // Find the content in the saved items
      const foundContent = savedItems.find((item) => item.id === contentId);

      if (foundContent) {
        setContent({
          id: foundContent.id,
          title: foundContent.title,
          content: foundContent.content,
          sources: foundContent.sources || [],
        });
      } else {
        console.error("Content not found in saved items");
        setContent(null);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      setContent(null);
    } finally {
      setIsLoading(false);
      endTiming("fetchSavedContent");
    }
  }, [contentId, savedItems]);

  // Initialize modal with optimizations
  useEffect(() => {
    if (isOpen) {
      setAnimationActive(true);
      fetchContent();

      // Focus trap and keyboard handling
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scrolling

      document.body.classList.add("modal-open");

      // Apply performance optimizations
      if (modalRef.current) {
        optimizeUITransitions(modalRef.current);
      }
      if (contentRef.current) {
        optimizeScrolling(contentRef.current);
      }

      return () => {
        document.body.classList.remove("modal-open");
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = ""; // Restore scrolling
      };
    } else {
      setAnimationActive(false);
    }
  }, [isOpen, fetchContent]);

  // Close on click outside
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`view-content-modal-overlay ${
        animationActive ? "active" : ""
      }`}
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-label="View Content"
    >
      <div
        className={`view-content-modal ${animationActive ? "active" : ""}`}
        ref={modalRef}
      >
        {/* Modal Header */}
        <div className="view-content-modal-header">
          <h2 className="view-content-title">
            {isLoading ? "Loading content..." : content?.title || "Content"}
          </h2>
          <button
            className="view-content-close-button"
            onClick={onClose}
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="view-content-body" ref={contentRef}>
          {isLoading ? (
            <div className="content-loading-skeleton">
              <div
                className="skeleton-line"
                style={{ width: "100%", height: "24px" }}
              ></div>
              <div
                className="skeleton-line"
                style={{ width: "90%", height: "24px" }}
              ></div>
              <div
                className="skeleton-line"
                style={{ width: "95%", height: "24px" }}
              ></div>
              <div
                className="skeleton-line"
                style={{ width: "85%", height: "24px" }}
              ></div>
              <div
                className="skeleton-line"
                style={{ width: "92%", height: "24px" }}
              ></div>
            </div>
          ) : (
            <>
              <div className="content-text">
                {content?.content || "No content available"}
              </div>

              {/* Sources Section */}
              {content?.sources && content.sources.length > 0 && (
                <div className="content-sources">
                  <h3 className="sources-title">Sources</h3>
                  <ul className="sources-list">
                    {content.sources.map((source, index) => (
                      <li key={index} className="source-item">
                        <a
                          href={source.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="source-link"
                        >
                          {source.title || source.link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewContentModal;
