import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { handleApiError } from "../../utils/apiUtils";
import { API_URL } from "../../utils/config";

// Types
interface QueryResult {
  response: string;
  sources?: Array<{
    title: string;
    link: string;
    snippet: string;
  }>;
  metadata?: Record<string, any>;
}

interface QueryHistoryItem {
  id: string;
  query: string;
  response: string;
  timestamp: string;
}

interface KnowledgeState {
  currentQuery: string;
  currentResult: QueryResult | null;
  history: QueryHistoryItem[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: KnowledgeState = {
  currentQuery: "",
  currentResult: null,
  history: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchInformation = createAsyncThunk(
  "knowledge/fetchInformation",
  async (
    {
      query,
      additionalContext = {},
      saveToHistory = true,
    }: {
      query: string;
      additionalContext?: Record<string, any>;
      saveToHistory?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_URL}/api/agent/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          query,
          additional_context: additionalContext,
          save_to_history: saveToHistory,
        }),
      });

      if (!response.ok) {
        const errorMessage = await handleApiError(
          response,
          "Information retrieval failed"
        );
        return rejectWithValue(errorMessage);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue("Information retrieval failed. Please try again.");
    }
  }
);

export const fetchQueryHistory = createAsyncThunk(
  "knowledge/fetchQueryHistory",
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}/api/agent/history?limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorMessage = await handleApiError(
          response,
          "Failed to fetch query history"
        );
        return rejectWithValue(errorMessage);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        "Failed to fetch query history. Please try again."
      );
    }
  }
);

// Knowledge slice
const knowledgeSlice = createSlice({
  name: "knowledge",
  initialState,
  reducers: {
    setCurrentQuery: (state, action: PayloadAction<string>) => {
      state.currentQuery = action.payload;
    },
    clearCurrentResult: (state) => {
      state.currentResult = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch information
    builder
      .addCase(fetchInformation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchInformation.fulfilled,
        (state, action: PayloadAction<QueryResult>) => {
          state.isLoading = false;
          state.currentResult = action.payload;
        }
      )
      .addCase(fetchInformation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch query history
      .addCase(
        fetchQueryHistory.fulfilled,
        (state, action: PayloadAction<QueryHistoryItem[]>) => {
          state.history = action.payload;
        }
      )
      .addCase(fetchQueryHistory.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentQuery, clearCurrentResult, clearError } =
  knowledgeSlice.actions;
export default knowledgeSlice.reducer;
