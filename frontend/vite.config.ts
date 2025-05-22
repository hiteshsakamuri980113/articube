import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward API requests to the backend
      "/api": {
        target: "http://localhost:8000", // FastAPI backend URL
        changeOrigin: true,
        secure: false,
        // Remove the /api prefix when forwarding to backend
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
    // Configure CORS for development
    cors: true,
  },
});
