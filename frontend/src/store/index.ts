import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import knowledgeReducer from "./slices/knowledgeSlice";
import SavedContentReducer from "./slices/SavedContentSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    knowledge: knowledgeReducer,
    savedItems: SavedContentReducer,
    ui: uiReducer,
  },
  // Additional middleware can be added here if needed
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
