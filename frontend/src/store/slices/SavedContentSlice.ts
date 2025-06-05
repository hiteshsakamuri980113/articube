import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { handleApiError } from "../../utils/apiUtils";
import { API_URL } from "../../utils/config";

// Types for content
interface SavedContent {
  id: string;
  title: string;
  snippet: string;
  content: string;
  sources: [];
  saved_at: string;
}

interface ContentState {
  savedItems: SavedContent[];
  currentItem: SavedContent | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
}

// Initial state
const initialState: ContentState = {
  savedItems: [],
  currentItem: null,
  loading: false,
  error: null,
  totalItems: 0,
};

// Helper function to extract title from response
const extractTitle = (response: string): string => {
  const lines = response.split("\n").filter((line) => line.trim());
  return lines[0] || "Untitled Search Result";
};

// Helper function to create snippet from response
const createSnippet = (response: string): string => {
  const lines = response.split("\n").filter((line) => line.trim());
  // Remove the title line and take the next few lines
  const contentLines = lines.slice(1);
  const snippet = contentLines.join(" ").substring(0, 200);
  return snippet || "No preview available";
};

// Save search result action
export const saveContent = createAsyncThunk(
  "content/saveContent",
  async (
    searchData: {
      response: string;
      sources?: Array<{ title: string; link?: string }>;
    },
    { rejectWithValue }
  ) => {
    try {
      // Extract title from first line of response
      const title = extractTitle(searchData.response);

      // Create snippet excluding title
      const snippet = createSnippet(searchData.response);

      // Prepare the payload according to the required structure
      const payload = {
        title,
        snippet,
        content: searchData.response, // Entire response
        sources: searchData.sources || [], // Entire sources array
      };

      const response = await fetch(`${API_URL}/api/content/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorMessage = await handleApiError(
          response,
          "Failed to save search result"
        );
        return rejectWithValue(errorMessage);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue("Failed to save search result. Please try again.");
    }
  }
);

// Fetch saved search results
export const fetchSavedContents = createAsyncThunk(
  "content/fetchSavedContents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/content/saved`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorMessage = await handleApiError(
          response,
          "Failed to fetch saved search results"
        );
        return rejectWithValue(errorMessage);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        "Failed to fetch saved search results. Please try again."
      );
    }
  }
);

// Delete saved search result
export const deleteSavedContent = createAsyncThunk(
  "content/deleteContent",
  async (contentId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}/api/content/delete?content_id=${contentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorMessage = await handleApiError(
          response,
          "Failed to delete saved search result"
        );
        return rejectWithValue(errorMessage);
      }

      return contentId;
    } catch (error) {
      return rejectWithValue(
        "Failed to delete saved search result. Please try again."
      );
    }
  }
);

// Content slice
const savedContentSlice = createSlice({
  name: "savedItems",
  initialState,
  reducers: {
    clearCurrentContent: (state) => {
      state.currentItem = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch contents
    builder
      // Save search result (from knowledgeSlice)
      .addCase(saveContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveContent.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(saveContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch saved search results (from knowledgeSlice)
      .addCase(fetchSavedContents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSavedContents.fulfilled, (state, action) => {
        state.loading = false;
        // Add to savedItems with item_type: "SavedContent[]"
        state.savedItems = action.payload as SavedContent[];
      })
      .addCase(fetchSavedContents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete saved search result (from knowledgeSlice)
      .addCase(deleteSavedContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteSavedContent.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          // Remove from allSavedItems
          state.savedItems = state.savedItems.filter(
            (item) => item.id !== action.payload
          );
        }
      )
      .addCase(deleteSavedContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentContent, clearError } = savedContentSlice.actions;
export default savedContentSlice.reducer;
