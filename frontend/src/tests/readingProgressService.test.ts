import {
  saveReadingProgress,
  getReadingProgress,
  getAllReadingProgress,
  deleteReadingProgress,
  getRecentReadingItems,
} from "../services/readingProgressService";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Replace the global localStorage with our mock
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

const STORAGE_KEY = "articube_reading_progress";

describe("Reading Progress Service", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
  });

  test("should save reading progress", () => {
    const contentId = "test-content-1";
    const position = 500;
    const totalHeight = 1000;
    const notes = "Test notes";

    saveReadingProgress(contentId, position, totalHeight, notes);

    // Check if data was saved
    const savedData = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) || "{}"
    );

    expect(savedData).toHaveProperty(contentId);
    expect(savedData[contentId]).toHaveProperty("position", position);
    expect(savedData[contentId]).toHaveProperty("completionPercentage", 50); // 500/1000 * 100
    expect(savedData[contentId]).toHaveProperty("notes", notes);
  });

  test("should get reading progress for a specific content", () => {
    const contentId = "test-content-2";
    const position = 750;
    const totalHeight = 1000;

    saveReadingProgress(contentId, position, totalHeight);

    const progress = getReadingProgress(contentId);

    expect(progress).not.toBeNull();
    expect(progress?.contentId).toBe(contentId);
    expect(progress?.position).toBe(position);
    expect(progress?.completionPercentage).toBe(75); // 750/1000 * 100
  });

  test("should return null for non-existent content progress", () => {
    const nonExistentId = "non-existent";

    const progress = getReadingProgress(nonExistentId);

    expect(progress).toBeNull();
  });

  test("should get all reading progress sorted by last read date", () => {
    // Add multiple progress entries with different dates
    const contentId1 = "test-content-3";
    const contentId2 = "test-content-4";
    const contentId3 = "test-content-5";

    // Save in random order
    saveReadingProgress(contentId2, 200, 1000);
    saveReadingProgress(contentId1, 300, 1000);
    saveReadingProgress(contentId3, 400, 1000);

    // Manually set the dates for testing
    const data = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");

    // Set different dates (newest to oldest)
    const now = new Date();
    data[contentId1].lastRead = new Date(now.getTime() - 3600000).toISOString(); // 1 hour ago
    data[contentId2].lastRead = new Date(now.getTime() - 7200000).toISOString(); // 2 hours ago
    data[contentId3].lastRead = new Date().toISOString(); // now

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    // Get all progress
    const allProgress = getAllReadingProgress();

    // Expect them to be sorted by date (newest first)
    expect(allProgress).toHaveLength(3);
    expect(allProgress[0].contentId).toBe(contentId3); // newest
    expect(allProgress[1].contentId).toBe(contentId1);
    expect(allProgress[2].contentId).toBe(contentId2); // oldest
  });

  test("should delete reading progress", () => {
    const contentId = "test-content-6";
    saveReadingProgress(contentId, 100, 1000);

    // Verify it was saved
    expect(getReadingProgress(contentId)).not.toBeNull();

    // Delete it
    deleteReadingProgress(contentId);

    // Verify it's gone
    expect(getReadingProgress(contentId)).toBeNull();
  });

  test("should get recent reading items with limit", () => {
    // Save multiple items
    for (let i = 1; i <= 10; i++) {
      saveReadingProgress(`test-content-${i}`, 100, 1000);
    }

    // Get only 5 recent items
    const recentItems = getRecentReadingItems(5);

    // Should return exactly 5 items
    expect(recentItems).toHaveLength(5);
  });
});
