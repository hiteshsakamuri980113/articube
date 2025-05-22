import axios from "axios";
import { store } from "../store";
import { logout } from "../store/slices/authSlice";
import {
  addNotification,
  NotificationType,
} from "../store/slices/notificationSlice";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "../utils/config";

// Create an Axios instance with default config
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Function to check token expiration
const checkTokenExpiration = () => {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      // If token expiration is within 5 minutes (300 seconds), notify the user
      if (decodedToken.exp && decodedToken.exp - currentTime < 300) {
        store.dispatch(
          addNotification({
            type: NotificationType.WARNING,
            title: "Session Expiring",
            message: "Your session will expire soon. Please save your work.",
            autoClose: false,
          })
        );
      }

      // If token is expired, logout the user
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        store.dispatch(logout());
        store.dispatch(
          addNotification({
            type: NotificationType.INFO,
            title: "Session Expired",
            message: "Your session has expired. Please log in again.",
          })
        );
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }
};

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    // Check token expiration on successful responses
    checkTokenExpiration();
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      store.dispatch(logout());
      store.dispatch(
        addNotification({
          type: NotificationType.ERROR,
          title: "Authentication Error",
          message: "Your session has ended. Please log in again.",
        })
      );
    }

    return Promise.reject(error);
  }
);

export default api;
