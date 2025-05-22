import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import type { PayloadAction } from "@reduxjs/toolkit";
import { handleApiError } from "../../utils/apiUtils";
import { API_URL } from "../../utils/config";

// Types
interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
  error: null,
};

// Async thunks for authentication
export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      // FastAPI OAuth2 expects username (not email) and password in URL-encoded form format
      const formData = new URLSearchParams();
      formData.append("username", email); // Using email as username
      formData.append("password", password);

      const response = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(), // Send as URL-encoded form data
      });

      if (!response.ok) {
        const errorMessage = await handleApiError(response, "Login failed");
        return rejectWithValue(errorMessage);
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      return data;
    } catch (error) {
      return rejectWithValue("Login failed. Please try again.");
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };

      if (!auth.token) {
        return rejectWithValue("No authentication token");
      }

      const response = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (!response.ok) {
        const errorMessage = await handleApiError(
          response,
          "Failed to fetch user data"
        );
        return rejectWithValue(errorMessage);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue("Failed to fetch user data");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    {
      email,
      username,
      password,
      fullName,
    }: { email: string; username: string; password: string; fullName?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          password,
          full_name: fullName,
        }),
      });

      if (!response.ok) {
        const errorMessage = await handleApiError(
          response,
          "Registration failed"
        );
        return rejectWithValue(errorMessage);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue("Registration failed. Please try again.");
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.access_token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        // Ensure error is always a string
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload
            ? String(action.payload)
            : "An unexpected error occurred";
      })

      // Fetch current user cases
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        // Ensure error is always a string
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload
            ? String(action.payload)
            : "An unexpected error occurred";
        state.isAuthenticated = false;
        state.token = null;
        localStorage.removeItem("token");
      })

      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        // We don't automatically log in after registration
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        // Ensure error is always a string
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload
            ? String(action.payload)
            : "An unexpected error occurred";
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
