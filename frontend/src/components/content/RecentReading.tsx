import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRecentReadingItems } from "../../services/readingProgressService";
import type { ReadingProgress } from "../../services/readingProgressService";
import { useAppSelector } from "../../hooks/reduxHooks";
import Card from "../common/Card";

interface RecentReadingProps {
  limit?: number;
  className?: string;
}

const RecentReading: React.FC<RecentReadingProps> = ({
  limit = 3,
  className = "",
}) => {
  const [recentItems, setRecentItems] = useState<ReadingProgress[]>([]);
  const { items } = useAppSelector((state: any) => state.content);

  useEffect(() => {
    // Get recent reading progress items
    const progress = getRecentReadingItems(limit);
    setRecentItems(progress);
  }, [limit]);

  // Find content details for an item by ID
  const getContentDetails = (contentId: string) => {
    return items.find((item: any) => item.id === contentId);
  };

  if (recentItems.length === 0) {
    return null;
  }

  const formatLastRead = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-3">Continue Reading</h3>

      <div className="space-y-3">
        {recentItems.map((item) => {
          const content = getContentDetails(item.contentId);

          return (
            <Card
              key={item.contentId}
              className="p-3 transition-all hover:shadow-md"
            >
              <Link to={`/app/content/${item.contentId}`} className="block">
                <div className="flex items-start">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-ios-gray-900 dark:text-white truncate">
                      {content?.title || "Untitled Content"}
                    </h4>

                    <div className="mt-1 flex items-center text-xs text-ios-gray-500 dark:text-ios-gray-400">
                      <span>{formatLastRead(item.lastRead)}</span>
                      <span className="mx-2">•</span>
                      <span>{item.completionPercentage}% complete</span>
                    </div>
                  </div>

                  <div className="ml-3 flex-shrink-0">
                    <div className="relative h-10 w-10 bg-ios-gray-100 dark:bg-ios-gray-800 rounded-md flex items-center justify-center overflow-hidden">
                      {content?.content_type === "article" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-ios-blue"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-ios-purple"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reading progress bar */}
                <div className="mt-2 w-full bg-ios-gray-200 dark:bg-ios-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-ios-blue h-1.5 rounded-full"
                    style={{ width: `${item.completionPercentage}%` }}
                  />
                </div>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RecentReading;
