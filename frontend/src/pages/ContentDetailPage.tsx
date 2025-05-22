import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { useNotification } from "../hooks/useNotification";
import {
  fetchContentDetail,
  saveContent,
  unsaveContent,
} from "../store/slices/contentSlice";
import {
  saveReadingProgress,
  getReadingProgress,
} from "../services/readingProgressService";
import Button from "../components/common/Button";
import AppleHeader from "../components/common/AppleHeader";
import ReadingProgressBar from "../components/common/ReadingProgressBar";
import ErrorBoundary from "../components/common/ErrorBoundary";

/**
 * Content detail page component
 */
const ContentDetailPage = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useNotification();
  const contentRef = useRef<HTMLDivElement>(null);

  const { currentItem, savedItems, loading, error } = useAppSelector(
    (state: any) => state.content
  );

  const [readPosition, setReadPosition] = useState<number>(0);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");
  const [notesVisible, setNotesVisible] = useState<boolean>(false);
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [savedProgress, setSavedProgress] = useState<number>(0);

  useEffect(() => {
    if (contentId) {
      dispatch(fetchContentDetail(contentId));

      // Check for saved reading progress
      const progress = getReadingProgress(contentId);
      if (progress) {
        setNotes(progress.notes || "");
        setSavedProgress(progress.completionPercentage);

        // Scroll to the saved position after a short delay to allow content to load
        setTimeout(() => {
          window.scrollTo({
            top: progress.position,
            behavior: "smooth",
          });
          setReadPosition(progress.position);
        }, 1000);
      }
    }
  }, [dispatch, contentId]);

  // Check if content is saved
  useEffect(() => {
    if (contentId && savedItems.length > 0) {
      const saved = savedItems.some((item: any) => item.id === contentId);
      setIsSaved(saved);
    }
  }, [savedItems, contentId]);

  // Track scroll position to save reading progress
  useEffect(() => {
    // Function to update progress and position
    const handleScroll = () => {
      const position = window.scrollY;
      setReadPosition(position);

      // Calculate reading progress percentage
      if (contentRef.current) {
        const totalHeight =
          contentRef.current.scrollHeight - window.innerHeight;
        const progress = Math.min(
          Math.round((position / totalHeight) * 100),
          100
        );
        setReadingProgress(progress);

        // Automatically save reading progress periodically (debounced)
        if (contentId) {
          saveReadingProgress(contentId, position, totalHeight, notes);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Save progress when unmounting
    return () => {
      window.removeEventListener("scroll", handleScroll);

      // Save final position on component unmount
      if (contentId && contentRef.current) {
        const totalHeight =
          contentRef.current.scrollHeight - window.innerHeight;
        saveReadingProgress(contentId, readPosition, totalHeight, notes);
      }
    };
  }, [contentId, readPosition, notes]);

  const handleSaveContent = () => {
    if (!contentId) return;

    if (isSaved) {
      dispatch(unsaveContent(contentId));
      showInfo("Content removed from saved items");
      setIsSaved(false);
    } else {
      dispatch(
        saveContent({
          contentId,
          readPosition,
          notes,
        })
      );
      showSuccess("Content saved successfully");
      setIsSaved(true);
    }

    // Save current reading progress
    if (contentRef.current && contentId) {
      const totalHeight = contentRef.current.scrollHeight - window.innerHeight;
      saveReadingProgress(contentId, readPosition, totalHeight, notes);
    }
  };

  const handleSaveNotes = () => {
    if (!contentId) return;

    dispatch(
      saveContent({
        contentId,
        readPosition,
        notes,
      })
    );
    setNotesVisible(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-16 bg-[var(--surface-primary)] rounded-lg border border-[var(--border)] shadow-sm">
        <svg
          className="animate-spin w-12 h-12 text-[var(--accent)]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span className="mt-4 text-[var(--text-secondary)] font-medium">
          Loading content...
        </span>
      </div>
    );
  }

  if (error || !currentItem) {
    return (
      <div className="p-8 text-center bg-[var(--surface-primary)] rounded-lg border border-[var(--border)] shadow-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--surface-secondary)] flex items-center justify-center">
          <svg
            className="w-8 h-8 text-[var(--text-tertiary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-3 text-[var(--text-primary)]">
          Content Not Found
        </h3>
        <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
          The content you're looking for doesn't exist or could not be loaded.
          Please check the URL or try again later.
        </p>
        <Button
          onClick={() => navigate("/app")}
          className="flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div>
        {/* Sticky reading progress bar at the top */}
        <div className="sticky top-0 left-0 right-0 z-10 py-2 px-3 bg-[var(--surface-primary)] bg-opacity-90 backdrop-blur-md border-b border-[var(--border)] shadow-sm">
          <ReadingProgressBar
            contentId={contentId || ""}
            savedProgress={savedProgress}
            className="w-full h-1.5"
          />
        </div>

        {/* Content header */}
        <div className="mb-8">
          <AppleHeader
            title={currentItem.title}
            subtitle={`Last updated: ${new Date(
              currentItem.created_at
            ).toLocaleString()}`}
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            }
          />

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--surface-secondary)] text-[var(--text-primary)] border border-[var(--border)] flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              {currentItem.content_type}
            </span>

            {currentItem.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent-light)] text-[var(--accent)] flex items-center gap-1"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                {tag}
              </span>
            ))}

            <div className="ml-auto">
              <Button
                variant={isSaved ? "outline" : "primary"}
                onClick={handleSaveContent}
                className="flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d={
                      isSaved
                        ? "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        : "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    }
                  />
                </svg>
                {isSaved ? "Unsave" : "Save"}
              </Button>
            </div>
          </div>

          {currentItem.summary && (
            <div className="p-5 mb-6 border-l-2 border-[var(--accent)] rounded-r-lg bg-[var(--surface-secondary)]">
              <h3 className="font-medium mb-2 flex items-center gap-2 text-[var(--accent)]">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Summary
              </h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {currentItem.summary}
              </p>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="bg-[var(--surface-primary)] rounded-lg border border-[var(--border)] shadow-sm p-6">
          <div
            ref={contentRef}
            className="prose prose-sm md:prose-base max-w-none prose-headings:text-[var(--accent)] prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-img:shadow-sm"
          >
            <div
              dangerouslySetInnerHTML={{
                __html: currentItem.full_content.replace(/\n/g, "<br/>"),
              }}
            />
          </div>
        </div>

        {/* Content actions */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3 p-4 bg-[var(--surface-secondary)] rounded-lg border border-[var(--border)]">
          <Button
            variant="secondary"
            onClick={() => navigate("/app")}
            className="flex items-center justify-center gap-1.5 sm:text-sm"
            size="sm"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </Button>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => setNotesVisible(!notesVisible)}
              className="flex items-center justify-center gap-1.5 sm:text-sm"
              size="sm"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d={
                    notesVisible
                      ? "M6 18L18 6M6 6l12 12"
                      : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  }
                />
              </svg>
              {notesVisible ? "Hide Notes" : "Notes"}
            </Button>

            <Button
              variant={isSaved ? "outline" : "primary"}
              onClick={handleSaveContent}
              className="flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d={
                    isSaved
                      ? "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      : "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  }
                />
              </svg>
              {isSaved ? "Unsave" : "Save"}
            </Button>
          </div>
        </div>

        {/* Notes section */}
        {notesVisible && (
          <div className="mt-6 bg-[var(--surface-primary)] rounded-lg border border-[var(--border)] shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)]">
              <h3 className="font-medium text-base flex items-center gap-2 text-[var(--text-primary)]">
                <svg
                  className="w-4 h-4 text-[var(--accent)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Your Notes
              </h3>
            </div>
            <div className="p-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your notes about this content..."
                className="w-full p-3 rounded-md bg-[var(--surface-secondary)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all resize-none"
                rows={6}
              ></textarea>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleSaveNotes}
                  className="flex items-center gap-1.5"
                  size="sm"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Save Notes
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Sources section if available */}
        {currentItem.metadata?.sources && (
          <div className="mt-6 bg-[var(--surface-primary)] rounded-lg border border-[var(--border)] shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)]">
              <h3 className="font-medium text-base text-[var(--text-primary)]">
                Sources
              </h3>
            </div>
            <div className="p-4 space-y-2 divide-y divide-[var(--border)]">
              {currentItem.metadata.sources.map(
                (source: any, index: number) => (
                  <div key={index} className="py-2 first:pt-0 last:pb-0">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--accent)] hover:underline flex items-center gap-2 group"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      {source.title || source.url}
                    </a>
                    {source.description && (
                      <p className="text-sm text-[var(--text-secondary)] mt-1 pl-6">
                        {source.description}
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ContentDetailPage;
