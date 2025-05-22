import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import {
  fetchSavedContents,
  unsaveContent,
} from "../store/slices/contentSlice";
import { setCurrentView } from "../store/slices/uiSlice";
import Button from "../components/common/Button";
import AppleHeader from "../components/common/AppleHeader";

/**
 * Saved content page component
 */
const SavedPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { savedItems, loading } = useAppSelector((state) => state.content);

  useEffect(() => {
    // Set current view
    dispatch(setCurrentView("saved"));

    // Fetch saved content
    dispatch(fetchSavedContents());
  }, [dispatch]);

  const handleViewContent = (contentId: string) => {
    navigate(`/app/content/${contentId}`);
  };

  const handleRemoveSaved = (contentId: string) => {
    dispatch(unsaveContent(contentId));
  };

  return (
    <div>
      <AppleHeader
        title="Saved Content"
        subtitle="Access your saved articles, documents, and information"
        icon={<span className="text-xl">🔖</span>}
      />

      {/* Content grid */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-12 bg-[var(--surface-primary)] rounded-lg border border-[var(--border)] shadow-sm">
          <div className="relative">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--border)]"></div>
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[var(--accent)] absolute inset-0"></div>
          </div>
          <span className="mt-4 text-[var(--accent)] font-medium">
            Loading saved content...
          </span>
        </div>
      ) : savedItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedItems.map((item) => (
            <div
              key={item.id}
              className="h-full bg-[var(--surface-primary)] rounded-lg border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="h-full flex flex-col p-5">
                <div className="flex-1">
                  <h3 className="font-medium text-lg mb-3 text-[var(--text-primary)]">
                    {item.title}
                  </h3>
                  <p className="text-[var(--text-secondary)] mb-4 line-clamp-3">
                    {item.summary || "No summary available"}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--surface-secondary)] text-[var(--text-primary)] border border-[var(--border)] flex items-center gap-1">
                      📄 {item.content_type}
                    </span>

                    {item.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent-light)] text-[var(--accent)] flex items-center gap-1"
                      >
                        🏷️ {tag}
                      </span>
                    ))}

                    {item.tags.length > 3 && (
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--surface-tertiary)] text-[var(--text-tertiary)] border border-[var(--border)] flex items-center gap-1">
                        ⋯ +{item.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4 pt-4 border-t border-[var(--border)]">
                  <div className="text-sm text-[var(--text-tertiary)] flex items-center gap-1">
                    📅 Saved on {new Date(item.created_at).toLocaleDateString()}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRemoveSaved(item.id)}
                      className="flex items-center gap-1.5"
                    >
                      🗑️ Remove
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleViewContent(item.id)}
                      className="flex items-center gap-1.5"
                    >
                      👁️ Open
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-[var(--surface-primary)] border border-dashed border-[var(--border)] rounded-lg shadow-sm">
          <div className="py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--accent-light)] flex items-center justify-center">
              <span className="text-4xl text-[var(--accent)]">🔖</span>
            </div>
            <h3 className="text-lg font-medium mb-3 text-[var(--text-primary)]">
              No saved content yet
            </h3>
            <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
              When you find interesting content, save it to access it later.
              Your saved items will appear here for easy reference.
            </p>
            <Button
              onClick={() => navigate("/app/search")}
              className="flex items-center gap-2 mx-auto"
            >
              🔍 Start Searching
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedPage;
