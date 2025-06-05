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
import ErrorBoundary from "./components/common/ErrorBoundary";

// App initialization component
const AppInit = () => {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector((state: any) => state.auth);

  useEffect(() => {
    console.log("app.tsx use effect called");
    // Try to authenticate with stored token if exists
    console.log(
      `token and isAuthenticated are: ${token} and ${isAuthenticated}`
    );
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token, isAuthenticated]);

  return (
    <ErrorBoundary>
      <>
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
