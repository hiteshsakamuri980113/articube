/**
 * Reading Progress Service
 * Handles saving and retrieving reading progress for articles
 */

// Type definitions for reading progress
export interface ReadingProgress {
  contentId: string;
  position: number;
  lastRead: Date;
  completionPercentage: number;
  notes?: string;
}

const STORAGE_KEY = "articube_reading_progress";

/**
 * Save reading progress for a specific content
 */
export const saveReadingProgress = (
  contentId: string,
  position: number,
  totalHeight: number,
  notes?: string
): void => {
  try {
    // Get existing progress data
    const existingData = getReadingProgressData();

    // Calculate completion percentage
    const completionPercentage = Math.min(
      Math.round((position / totalHeight) * 100),
      100
    );

    // Create new progress entry
    const progressEntry: ReadingProgress = {
      contentId,
      position,
      lastRead: new Date(),
      completionPercentage,
      notes,
    };

    // Update existing data
    const updatedData = {
      ...existingData,
      [contentId]: progressEntry,
    };

    // Save to local storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error("Error saving reading progress:", error);
  }
};

/**
 * Get reading progress for a specific content
 */
export const getReadingProgress = (
  contentId: string
): ReadingProgress | null => {
  try {
    const data = getReadingProgressData();
    return data[contentId] || null;
  } catch (error) {
    console.error("Error getting reading progress:", error);
    return null;
  }
};

/**
 * Get all reading progress data
 */
export const getAllReadingProgress = (): ReadingProgress[] => {
  try {
    const data = getReadingProgressData();
    return Object.values(data).sort(
      (a, b) => new Date(b.lastRead).getTime() - new Date(a.lastRead).getTime()
    );
  } catch (error) {
    console.error("Error getting all reading progress:", error);
    return [];
  }
};

/**
 * Delete reading progress for a specific content
 */
export const deleteReadingProgress = (contentId: string): void => {
  try {
    const data = getReadingProgressData();

    if (data[contentId]) {
      delete data[contentId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (error) {
    console.error("Error deleting reading progress:", error);
  }
};

/**
 * Get recent reading items (limit by count)
 */
export const getRecentReadingItems = (limit: number = 5): ReadingProgress[] => {
  try {
    const allProgress = getAllReadingProgress();
    return allProgress.slice(0, limit);
  } catch (error) {
    console.error("Error getting recent reading items:", error);
    return [];
  }
};

/**
 * Helper function to get reading progress data from storage
 */
const getReadingProgressData = (): Record<string, ReadingProgress> => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const parsedData = JSON.parse(storedData);

      // Convert stored date strings to Date objects
      Object.keys(parsedData).forEach((key) => {
        parsedData[key].lastRead = new Date(parsedData[key].lastRead);
      });

      return parsedData;
    }
    return {};
  } catch (error) {
    console.error("Error parsing reading progress data:", error);
    return {};
  }
};
