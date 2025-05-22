import { createContext, useState } from "react";
import type { ReactNode } from "react";
import axios from "axios";

// API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Types
export interface Content {
  id: string;
  title: string;
  summary?: string;
  content_type: string;
  metadata: Record<string, any>;
  tags: string[];
  source_url?: string;
  created_at: string;
  view_count: number;
}

export interface ContentWithFullText extends Content {
  full_content: string;
}

interface ContentContextType {
  isLoading: boolean;
  contentList: Content[];
  savedContent: Content[];
  currentContent: ContentWithFullText | null;
  error: string | null;
  fetchContentList: (
    skip?: number,
    limit?: number,
    contentType?: string,
    tag?: string
  ) => Promise<void>;
  fetchContentById: (contentId: string) => Promise<ContentWithFullText | null>;
  saveContent: (
    contentId: string,
    readPosition?: number,
    notes?: string
  ) => Promise<boolean>;
  unsaveContent: (contentId: string) => Promise<boolean>;
  fetchSavedContent: () => Promise<void>;
}

// Create context
export const ContentContext = createContext<ContentContextType>({
  isLoading: false,
  contentList: [],
  savedContent: [],
  currentContent: null,
  error: null,
  fetchContentList: async () => {},
  fetchContentById: async () => null,
  saveContent: async () => false,
  unsaveContent: async () => false,
  fetchSavedContent: async () => {},
});

interface ContentProviderProps {
  children: ReactNode;
}

// Content Provider
export const ContentProvider = ({ children }: ContentProviderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [contentList, setContentList] = useState<Content[]>([]);
  const [savedContent, setSavedContent] = useState<Content[]>([]);
  const [currentContent, setCurrentContent] =
    useState<ContentWithFullText | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch content list
  const fetchContentList = async (
    skip = 0,
    limit = 10,
    contentType?: string,
    tag?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const params: Record<string, any> = { skip, limit };
      if (contentType) params.content_type = contentType;
      if (tag) params.tag = tag;

      const res = await axios.get(`${API_URL}/api/content`, { params });
      setContentList(res.data);
    } catch (error) {
      console.error("Error fetching content list:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch content by ID
  const fetchContentById = async (
    contentId: string
  ): Promise<ContentWithFullText | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_URL}/api/content/${contentId}`);
      const content = res.data as ContentWithFullText;
      setCurrentContent(content);
      return content;
    } catch (error) {
      console.error("Error fetching content:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Save content
  const saveContent = async (
    contentId: string,
    readPosition?: number,
    notes?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await axios.post(`${API_URL}/api/content/${contentId}/save`, null, {
        params: {
          read_position: readPosition,
          notes,
        },
      });

      // Add to saved content if not already there
      if (!savedContent.some((content) => content.id === contentId)) {
        const contentToAdd = contentList.find(
          (content) => content.id === contentId
        );
        if (contentToAdd) {
          setSavedContent((prev) => [contentToAdd, ...prev]);
        }
      }

      return true;
    } catch (error) {
      console.error("Error saving content:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Unsave content
  const unsaveContent = async (contentId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await axios.delete(`${API_URL}/api/content/${contentId}/save`);

      // Remove from saved content
      setSavedContent((prev) =>
        prev.filter((content) => content.id !== contentId)
      );

      return true;
    } catch (error) {
      console.error("Error unsaving content:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch saved content
  const fetchSavedContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_URL}/api/content/saved/`);
      setSavedContent(res.data);
    } catch (error) {
      console.error("Error fetching saved content:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ContentContext.Provider
      value={{
        isLoading,
        contentList,
        savedContent,
        currentContent,
        error,
        fetchContentList,
        fetchContentById,
        saveContent,
        unsaveContent,
        fetchSavedContent,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export default ContentProvider;
