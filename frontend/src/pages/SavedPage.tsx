import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import {
  fetchSavedContents,
  deleteSavedContent,
} from "../store/slices/SavedContentSlice";
import { setCurrentView } from "../store/slices/uiSlice";
import Button from "../components/common/Button";
import ViewContentModal from "../components/content/ViewContentModal";
import "../styles/glassmorphism.css";
import "../styles/common-pages.css";
import "../styles/saved-content.css";
import "../styles/siri-text.css";
import ErrorBoundary from "../components/common/ErrorBoundary";

/**
 * Interface for grouped saved content
 */
interface GroupedContent {
  date: string; // Store as string for key lookup
  rawDate: Date; // Store the actual Date object for formatting
  items: SavedContent[];
}

/**
 * Interface for saved content
 */
interface SavedContent {
  id: string;
  title: string;
  snippet: string;
  content: string;
  sources: [];
  saved_at: string;
}

/**
 * Loading Skeleton Component for content cards
 */
const ContentSkeleton = () => {
  return (
    <div className="content-row">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="content-card skeleton-card"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="h-full overflow-hidden flex flex-col">
            <div className="skeleton-title mb-2"></div>
            <div className="skeleton-line mb-1"></div>
            <div className="skeleton-line mb-1"></div>
            <div className="skeleton-line mb-1" style={{ width: "75%" }}></div>

            {/* Add ghost buttons to simulate the action buttons */}
            <div className="skeleton-actions">
              <div className="skeleton-button"></div>
              <div className="skeleton-button"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * SavedPage component - displays saved content in Netflix-style rows
 */
const SavedPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { savedItems, loading } = useAppSelector((state) => state.savedItems);
  const [groupedContent, setGroupedContent] = useState<GroupedContent[]>([]);
  const rowRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState<string>("");

  // State to track current page for each date group
  const [currentPages, setCurrentPages] = useState<{ [key: string]: number }>(
    {}
  );

  useEffect(() => {
    // Set current view
    dispatch(setCurrentView("saved"));

    // Fetch saved content
    dispatch(fetchSavedContents());
  }, [dispatch]);

  // Group content by saved date whenever savedItems changes
  useEffect(() => {
    if (savedItems.length > 0) {
      const grouped = groupContentByDate(savedItems);
      setGroupedContent(grouped);

      // Initialize current pages state
      const initialPages: { [key: string]: number } = {};
      grouped.forEach((group) => {
        initialPages[group.date] = 0; // Start at page 0 for each group
      });

      setCurrentPages(initialPages);
    } else {
      setGroupedContent([]);
    }
  }, [savedItems]);

  /**
   * Group content by date
   */
  const groupContentByDate = (items: SavedContent[]): GroupedContent[] => {
    // Create a map to group by date
    const dateGroups = new Map<
      string,
      { items: SavedContent[]; rawDate: Date }
    >();

    items.forEach((item) => {
      const rawDate = new Date(item.saved_at);
      // Format the date string (date only, not time) for grouping
      const dateStr = rawDate.toLocaleDateString();

      if (!dateGroups.has(dateStr)) {
        dateGroups.set(dateStr, { items: [], rawDate });
      }
      dateGroups.get(dateStr)?.items.push(item);
    });

    // Convert map to array and sort by date (newest first)
    return Array.from(dateGroups.entries())
      .map(([dateStr, { items, rawDate }]) => ({
        date: dateStr,
        rawDate,
        items,
      }))
      .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
  };

  /**
   * Handle viewing content
   */
  const handleViewContent = (contentId: string) => {
    setSelectedContentId(contentId);
    setIsViewModalOpen(true);
  };

  /**
   * Handle removing saved content with confirmation
   */
  const handleRemoveSaved = (contentId: string) => {
    if (deleteConfirmId === contentId) {
      dispatch(deleteSavedContent(contentId));
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(contentId);
      // Auto-reset after 3 seconds
      setTimeout(() => {
        setDeleteConfirmId(null);
      }, 3000);
    }
  };

  /**
   * Handle scrolling a row to the left
   */
  const handleScrollLeft = (groupIndex: number) => {
    const groupKey = groupedContent[groupIndex].date;
    const currentPage = currentPages[groupKey] || 0;
    const totalItems = groupedContent[groupIndex].items.length;
    const totalPages = Math.ceil(totalItems / 4);

    // Add animation class
    const rowElement =
      rowRefs.current[groupIndex]?.querySelector(".content-row");
    if (rowElement) {
      rowElement.classList.add("page-changing");

      // Remove the class after animation completes
      setTimeout(() => {
        if (rowElement) {
          rowElement.classList.remove("page-changing");
        }
      }, 500); // Longer animation for smoother transition
    }

    // Calculate previous page, with wrap-around if at the beginning
    const prevPage = currentPage === 0 ? totalPages - 1 : currentPage - 1;

    // Update the current page
    setCurrentPages({
      ...currentPages,
      [groupKey]: prevPage,
    });
  };

  /**
   * Handle scrolling a row to the right
   */
  const handleScrollRight = (groupIndex: number) => {
    const groupKey = groupedContent[groupIndex].date;
    const currentPage = currentPages[groupKey] || 0;
    const totalItems = groupedContent[groupIndex].items.length;
    const totalPages = Math.ceil(totalItems / 4);

    // Add animation class
    const rowElement =
      rowRefs.current[groupIndex]?.querySelector(".content-row");
    if (rowElement) {
      rowElement.classList.add("page-changing");

      // Remove the class after animation completes
      setTimeout(() => {
        if (rowElement) {
          rowElement.classList.remove("page-changing");
        }
      }, 500); // Longer animation for smoother transition
    }

    // Calculate next page, with wrap-around if at the end
    const nextPage = (currentPage + 1) % totalPages;

    // Update the current page
    setCurrentPages({
      ...currentPages,
      [groupKey]: nextPage,
    });
  };

  /**
   * Get visible items for the current page
   */
  const getVisibleItems = (items: SavedContent[], groupKey: string) => {
    const currentPage = currentPages[groupKey] || 0;
    const startIndex = currentPage * 4;
    return items.slice(startIndex, startIndex + 4);
  };

  /**
   * Navigate to a specific page for a group
   */
  const navigateToPage = (groupIndex: number, pageIndex: number) => {
    const groupKey = groupedContent[groupIndex].date;

    // Add animation class
    const rowElement =
      rowRefs.current[groupIndex]?.querySelector(".content-row");
    if (rowElement) {
      rowElement.classList.add("page-changing");

      // Remove the class after animation completes
      setTimeout(() => {
        if (rowElement) {
          rowElement.classList.remove("page-changing");
        }
      }, 500); // Longer animation for smoother transition
    }

    setCurrentPages({
      ...currentPages,
      [groupKey]: pageIndex,
    });
  };

  /**
   * Determine if a page navigation is at the beginning or end
   */
  const isFirstPage = (groupDate: string) => {
    return (currentPages[groupDate] || 0) === 0;
  };

  const isLastPage = (groupDate: string, totalItems: number) => {
    const totalPages = Math.ceil(totalItems / 4);
    return (currentPages[groupDate] || 0) === totalPages - 1;
  };

  return (
    <ErrorBoundary>
      <div className="page-container">
        {/* Header styled like homepage */}
        <h1 className="text-2xl font-semibold mb-8 animated-gradient-text">
          Saved Content
        </h1>

        {/* Content section */}
        {loading ? (
          <div className="space-y-12 fade-in">
            {/* Show Netflix-style skeletons with staggered animation */}
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="saved-content-group"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="skeleton-header mb-3"></div>
                <div className="relative">
                  <ContentSkeleton />
                </div>
              </div>
            ))}
          </div>
        ) : groupedContent.length > 0 ? (
          <div className="space-y-8 fade-in">
            {groupedContent.map((group, groupIndex) => (
              <div key={groupIndex} className="saved-content-group">
                {/* Date section header with human-readable format */}
                <h2 className="section-date-header">
                  {group.rawDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h2>
                <div className="relative">
                  <div
                    ref={(el) => {
                      rowRefs.current[groupIndex] = el;
                    }}
                    className="content-row-container"
                  >
                    <div className="content-row">
                      {getVisibleItems(group.items, group.date).map((item) => (
                        <div
                          key={item.id}
                          className="content-card"
                          onClick={() => handleViewContent(item.id)}
                          tabIndex={0}
                          role="button"
                          aria-label={`View ${item.title}`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              handleViewContent(item.id);
                            }
                          }}
                        >
                          <div className="h-full overflow-hidden">
                            <h3 className="text-base font-medium mb-2 line-clamp-2 siri-heading text-gradient">
                              {item.title}
                            </h3>
                            <p className="text-xs mb-2 line-clamp-3 siri-text-subtle">
                              {item.snippet}
                            </p>
                          </div>

                          {/* Netflix-style action buttons that only appear on hover */}
                          <div className="card-actions">
                            <Button
                              variant={
                                deleteConfirmId === item.id
                                  ? "danger"
                                  : "outline"
                              }
                              size="sm"
                              className="min-w-[80px] w-[25%]"
                              onClick={(
                                e: React.MouseEvent<HTMLButtonElement>
                              ) => {
                                e.stopPropagation(); // Stop event from bubbling up to card
                                handleRemoveSaved(item.id);
                              }}
                            >
                              {deleteConfirmId === item.id
                                ? "Confirm"
                                : "Remove"}
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              className="min-w-[80px] w-[25%]"
                              onClick={(
                                e: React.MouseEvent<HTMLButtonElement>
                              ) => {
                                e.stopPropagation(); // Stop event from bubbling up to card
                                handleViewContent(item.id);
                              }}
                            >
                              Open
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scroll buttons and pagination indicators */}
                  {group.items.length > 4 && (
                    <>
                      {/* Always show both buttons, but add disabled class */}
                      <div
                        className={`scroll-button-left ${
                          isFirstPage(group.date) ? "invisible" : ""
                        }`}
                        onClick={() =>
                          !isFirstPage(group.date) &&
                          handleScrollLeft(groupIndex)
                        }
                        title="Previous Page"
                        role="button"
                        tabIndex={0}
                        aria-label="Previous page"
                        aria-disabled={isFirstPage(group.date)}
                        onKeyDown={(e) => {
                          if (
                            (e.key === "Enter" || e.key === " ") &&
                            !isFirstPage(group.date)
                          ) {
                            handleScrollLeft(groupIndex);
                          }
                        }}
                      >
                        <div className="scroll-button-icon">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="white"
                            className="text-white"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Right scroll button - always visible */}
                      <div
                        className={`scroll-button-right ${
                          isLastPage(group.date, group.items.length)
                            ? "invisible"
                            : ""
                        }`}
                        onClick={() =>
                          !isLastPage(group.date, group.items.length) &&
                          handleScrollRight(groupIndex)
                        }
                        title="Next Page"
                        role="button"
                        tabIndex={0}
                        aria-label="Next page"
                        aria-disabled={isLastPage(
                          group.date,
                          group.items.length
                        )}
                        onKeyDown={(e) => {
                          if (
                            (e.key === "Enter" || e.key === " ") &&
                            !isLastPage(group.date, group.items.length)
                          ) {
                            handleScrollRight(groupIndex);
                          }
                        }}
                      >
                        <div className="scroll-button-icon">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="white"
                            className="text-white"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Enhanced page indicator with dots only */}
                      <div className="page-indicator">
                        {Array.from({
                          length: Math.ceil(group.items.length / 4),
                        }).map((_, i) => (
                          <div
                            key={i}
                            className={`indicator-dot ${
                              (currentPages[group.date] || 0) === i
                                ? "active"
                                : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent event bubbling
                              navigateToPage(groupIndex, i);
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label={`Go to page ${i + 1}`}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                navigateToPage(groupIndex, i);
                              }
                            }}
                            title={`Page ${i + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center glass glass-card rounded-2xl fade-in">
            <div className="py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 opacity-20 flex items-center justify-center">
                <span className="text-4xl">📚</span>
              </div>
              <h3 className="text-xl font-medium mb-3 siri-heading text-gradient">
                No saved content yet
              </h3>
              <p className="siri-text-subtle mb-6 max-w-md mx-auto">
                When you find interesting content, save it to access it later.
              </p>
              <Button
                onClick={() => navigate("/app/search")}
                className="mx-auto"
              >
                Start Searching
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Content Modal */}
      <ViewContentModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        contentId={selectedContentId}
      />
    </ErrorBoundary>
  );
};

export default SavedPage;
