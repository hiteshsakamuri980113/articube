import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { useNotification } from "../hooks/useNotification";
import {
  fetchInformation,
  setCurrentQuery,
  clearCurrentResult,
} from "../store/slices/knowledgeSlice";
import { setCurrentView } from "../store/slices/uiSlice";
import Button from "../components/common/Button";
// import Card from "../components/common/Card";
import AppleHeader from "../components/common/AppleHeader";
import ErrorBoundary from "../components/common/ErrorBoundary";

/**
 * Search page for information queries, styled with Apple design principles
 */
const SearchPage = () => {
  const dispatch = useAppDispatch();
  // const navigate = useNavigate();
  const { currentQuery, currentResult, isLoading, history } = useAppSelector(
    (state: any) => state.knowledge
  );
  const { showError, showInfo } = useNotification();

  const [query, setQuery] = useState(currentQuery);

  useEffect(() => {
    // Set current view
    dispatch(setCurrentView("search"));
    dispatch(clearCurrentResult());
  }, [dispatch]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (query.trim()) {
      dispatch(setCurrentQuery(query));
      showInfo("Searching for information...", "Knowledge Search");

      try {
        const result = await dispatch(fetchInformation({ query })).unwrap();
        if (result && result.content) {
          showInfo("Search completed successfully", "Knowledge Search");
        }
      } catch (error) {
        showError(
          "Failed to retrieve information. Please try again.",
          "Search Error"
        );
      }
    }
  };

  const handleHistoryItemClick = (historyItem: string) => {
    setQuery(historyItem);
    dispatch(setCurrentQuery(historyItem));
    dispatch(fetchInformation({ query: historyItem }));
  };

  return (
    <ErrorBoundary>
      <div>
        <AppleHeader
          title="Knowledge Search"
          subtitle="Ask a question or search for a topic to get factual information"
          icon={<span className="text-xl">🔍</span>}
        />

        {/* Search form */}
        <div className="p-6 mb-8 bg-[var(--surface-primary)] border border-[var(--border)] rounded-lg shadow-sm">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)]">
                🔍
              </span>
              <input
                type="text"
                placeholder="What would you like to know?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 p-3 rounded-md bg-[var(--surface-secondary)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="min-w-[100px]"
              >
                {isLoading ? "Searching..." : "Search"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => dispatch(clearCurrentResult())}
                disabled={!currentResult}
                className="min-w-[100px]"
              >
                Clear
              </Button>
            </div>
          </form>
        </div>

        {/* Results section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Results display - takes up 2/3 of the grid on large screens */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="p-8 flex flex-col justify-center items-center bg-[var(--surface-primary)] rounded-lg border border-[var(--border)] shadow-sm">
                <div className="relative">
                  <div className="animate-spin text-4xl text-[var(--accent)]">
                    ⏳
                  </div>
                </div>
                <span className="mt-4 text-[var(--text-secondary)] font-medium">
                  Searching...
                </span>
              </div>
            ) : currentResult ? (
              <div className="bg-[var(--surface-primary)] rounded-lg border border-[var(--border)] shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <h3 className="font-medium text-base text-[var(--accent)]">
                    Results
                  </h3>
                </div>
                <div className="p-6">
                  <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: currentResult.response.replace(/\n/g, "<br/>"),
                      }}
                    />

                    {currentResult.sources &&
                      currentResult.sources.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-[var(--border)]">
                          <h3 className="font-medium text-[var(--text-primary)] mb-3 text-sm">
                            Sources
                          </h3>
                          <ul className="space-y-2 rounded-lg bg-[var(--surface-secondary)] divide-y divide-[var(--border)] border border-[var(--border)]">
                            {currentResult.sources.map(
                              (
                                source: {
                                  title: string;
                                  link: string;
                                  snippet: string;
                                },
                                index: number
                              ) => (
                                <li key={index} className="p-3">
                                  <div className="flex items-center justify-between">
                                    <a
                                      href={source.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[var(--accent)] hover:text-[var(--accent-secondary)] transition-colors flex items-center gap-2 text-sm font-medium"
                                    >
                                      {source.title}
                                    </a>
                                    <span className="text-[var(--text-tertiary)]">
                                      🔗
                                    </span>
                                  </div>
                                  {source.snippet && (
                                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                                      {source.snippet}
                                    </p>
                                  )}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-[var(--surface-primary)] rounded-lg border border-[var(--border)] shadow-sm">
                <div className="py-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--surface-secondary)] flex items-center justify-center">
                    <span className="text-3xl text-[var(--text-tertiary)]">
                      🔍
                    </span>
                  </div>
                  <h3 className="text-lg font-medium mb-3 text-[var(--text-primary)]">
                    Search for Knowledge
                  </h3>
                  <p className="text-[var(--text-secondary)] max-w-md mx-auto">
                    Ask any question or search for a topic to access factual
                    information from ArtiCube's knowledge base
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar - Recent searches and suggestions */}
          <div>
            {/* Recent Searches */}
            <div className="bg-[var(--surface-primary)] rounded-lg border border-[var(--border)] shadow-sm overflow-hidden mb-6">
              <div className="px-4 py-3 border-b border-[var(--border)]">
                <h3 className="font-medium text-base text-[var(--text-primary)]">
                  Recent Searches
                </h3>
              </div>
              {history.length > 0 ? (
                <div className="divide-y divide-[var(--border)]">
                  {history
                    .slice(0, 10)
                    .map(
                      (item: {
                        id: string;
                        query: string;
                        timestamp: string;
                        response: string;
                      }) => (
                        <button
                          key={item.id}
                          onClick={() => handleHistoryItemClick(item.query)}
                          className="w-full text-left p-3 hover:bg-[var(--surface-secondary)] transition-colors flex items-start gap-3"
                        >
                          {/* <div className="mt-1 shrink-0">
                            <svg
                              className="w-4 h-4 text-[var(--text-tertiary)]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div> */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-[var(--text-primary)]">
                              {item.query}
                            </p>
                            {/* <p className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
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
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              {new Date(item.timestamp).toLocaleString()}
                            </p> */}
                          </div>
                        </button>
                      )
                    )}
                </div>
              ) : (
                <div className="text-center py-6 text-[var(--text-tertiary)]">
                  <span className="text-3xl mx-auto mb-2 text-[var(--text-tertiary)]">
                    🕒
                  </span>
                  <p>No search history yet</p>
                </div>
              )}
            </div>

            {/* Sample Questions */}
            <div className="bg-[var(--surface-primary)] rounded-lg border border-[var(--border)] shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border)]">
                <h3 className="font-medium text-base text-[var(--text-primary)]">
                  Sample Questions
                </h3>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {[
                  {
                    question: "What happened during the Moon landing?",
                    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                  },
                  {
                    question: "Who invented the internet?",
                    icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
                  },
                  {
                    question: "What's the plot of Inception?",
                    icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
                  },
                  {
                    question: "How does photosynthesis work?",
                    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
                  },
                  {
                    question: "What are the main causes of climate change?",
                    icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                  },
                ].map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(item.question);
                      dispatch(setCurrentQuery(item.question));
                      dispatch(fetchInformation({ query: item.question }));
                    }}
                    className="w-full text-left p-3 hover:bg-[var(--surface-secondary)] transition-colors flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--accent-light)] flex items-center justify-center text-[var(--accent)] shrink-0">
                      <span>❓</span>
                    </div>
                    <span className="text-[var(--text-primary)]">
                      {item.question}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SearchPage;
