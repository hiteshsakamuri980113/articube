import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./hooks/reduxHooks";
import { fetchCurrentUser } from "./store/slices/authSlice";
import "./App.css";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import SavedPage from "./pages/SavedPage";
import AccountPage from "./pages/AccountPage";
import ContentDetailPage from "./pages/ContentDetailPage";
import TestPage from "./pages/TestPage";
import NotFoundPage from "./pages/NotFoundPage";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Import error boundary
import RouteErrorBoundary from "./components/common/RouteErrorBoundary";

// App Router Configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/test",
    element: <TestPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomePage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "search",
        element: <HomePage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "saved",
        element: <SavedPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "account",
        element: <AccountPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "content/:contentId",
        element: <ContentDetailPage />,
        errorElement: <RouteErrorBoundary />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

// Import components
import NotificationContainer from "./components/common/NotificationContainer";
import ErrorBoundary from "./components/common/ErrorBoundary";

// App initialization component
const AppInit = () => {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector((state: any) => state.auth);

  useEffect(() => {
    // Try to authenticate with stored token if exists
    if (token && !isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token, isAuthenticated]);

  return (
    <ErrorBoundary>
      <>
        <NotificationContainer />
        <div className="min-h-screen deep-space-bg">
          <RouterProvider router={router} />
        </div>
      </>
    </ErrorBoundary>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppInit />
    </Provider>
  );
}

export default App;
