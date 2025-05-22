import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../hooks/reduxHooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * A wrapper component for routes that should only be accessible to authenticated users
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  // If authentication is still being verified
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ios-blue"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute;
