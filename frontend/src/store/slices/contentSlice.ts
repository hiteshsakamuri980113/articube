import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { handleApiError } from "../../utils/apiUtils";
import { API_URL } from "../../utils/config";

// Types for content
interface ContentItem {
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

interface ContentDetail extends ContentItem {
  full_content: string;
}

interface ContentState {
  items: ContentItem[];
  savedItems: ContentItem[];
  currentItem: ContentDetail | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
}

// Initial state
const initialState: ContentState = {
  items: [],
  savedItems: [],
  currentItem: null,
  loading: false,
  error: null,
  totalItems: 0,
};

// Async thunks for content operations
export const fetchContents = createAsyncThunk(
  "content/fetchContents",
  async (
    {
      skip = 0,
      limit = 10,
      contentType,
      tag,
    }: { skip?: number; limit?: number; contentType?: string; tag?: string },
    { rejectWithValue }
  ) => {
    try {
      // Build query params
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
      });

      if (contentType) params.append("content_type", contentType);
      if (tag) params.append("tag", tag);

      const response = await fetch(
        `${API_URL}/api/content?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorMessage = await handleApiError(
          response,
          "Failed to fetch content"
        );
        return rejectWithValue(errorMessage);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue("Failed to fetch content");
    }
  }
);

export const fetchContentDetail = createAsyncThunk(
  "content/fetchContentDetail",
  async (contentId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/content/${contentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorMessage = await handleApiError(
          response,
          "Failed to fetch content detail"
        );
        return rejectWithValue(errorMessage);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue("Failed to fetch content detail");
    }
  }
);

export const fetchSavedContents = createAsyncThunk(
  "content/fetchSavedContents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/content/saved/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        return rejectWithValue("Failed to fetch saved content");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue("Failed to fetch saved content");
    }
  }
);

export const saveContent = createAsyncThunk(
  "content/saveContent",
  async (
    {
      contentId,
      readPosition,
      notes,
    }: { contentId: string; readPosition?: number; notes?: string },
    { rejectWithValue }
  ) => {
    try {
      const payload: Record<string, any> = {};
      if (readPosition !== undefined) payload.read_position = readPosition;
      if (notes !== undefined) payload.notes = notes;

      const response = await fetch(`${API_URL}/api/content/${contentId}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return rejectWithValue("Failed to save content");
      }

      return { contentId, ...(await response.json()) };
    } catch (error) {
      return rejectWithValue("Failed to save content");
    }
  }
);

export const unsaveContent = createAsyncThunk(
  "content/unsaveContent",
  async (contentId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/content/${contentId}/save`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        return rejectWithValue("Failed to unsave content");
      }

      return contentId;
    } catch (error) {
      return rejectWithValue("Failed to unsave content");
    }
  }
);

// Content slice
const contentSlice = createSlice({
  name: "content",
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
      .addCase(fetchContents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchContents.fulfilled,
        (state, action: PayloadAction<ContentItem[]>) => {
          state.loading = false;
          state.items = action.payload;
          state.totalItems = action.payload.length;
        }
      )
      .addCase(fetchContents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch content detail
      .addCase(fetchContentDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchContentDetail.fulfilled,
        (state, action: PayloadAction<ContentDetail>) => {
          state.loading = false;
          state.currentItem = action.payload;
        }
      )
      .addCase(fetchContentDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch saved contents
      .addCase(fetchSavedContents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSavedContents.fulfilled,
        (state, action: PayloadAction<ContentItem[]>) => {
          state.loading = false;
          state.savedItems = action.payload;
        }
      )
      .addCase(fetchSavedContents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Save content
      .addCase(saveContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveContent.fulfilled, (state) => {
        state.loading = false;
        // We'll refetch saved contents after saving
      })
      .addCase(saveContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Unsave content
      .addCase(unsaveContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        unsaveContent.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.savedItems = state.savedItems.filter(
            (item) => item.id !== action.payload
          );
        }
      )
      .addCase(unsaveContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentContent, clearError } = contentSlice.actions;
export default contentSlice.reducer;
