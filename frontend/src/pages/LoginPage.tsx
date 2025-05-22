import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { useNotification } from "../hooks/useNotification";
import { loginUser, clearError } from "../store/slices/authSlice";
import ErrorMessage from "../components/common/ErrorMessage";
import "../styles/glassmorphism.css";
import "../styles/siri-text.css";
import "../styles/common-pages.css";
import "../styles/text-utilities.css";

/**
 * Login page component with simplified glassmorphism design
 */
const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { showSuccess, showError } = useNotification();

  // State for subtle animated background elements - matching landing page
  const [backgroundElements, setBackgroundElements] = useState<
    Array<{
      id: number;
      size: number;
      x: number;
      y: number;
      opacity: number;
      delay: number;
    }>
  >([]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  useEffect(() => {
    // Generate background elements
    const elements = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      size: Math.random() * 400 + 200, // Larger size for more visible elements
      x: Math.random() * 100,
      y: Math.random() * 100,
      opacity: Math.random() * 0.06 + 0.02, // Slightly increased opacity
      delay: Math.random() * 5,
    }));
    setBackgroundElements(elements);

    // Clear any previous auth errors
    dispatch(clearError());

    // Show success message if redirected from registration
    const state = location.state as { registered?: boolean } | null;
    if (state?.registered) {
      showSuccess(
        "Account created successfully! Please sign in.",
        "Registration Complete"
      );
      // Reset the location state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [dispatch, location.state, showSuccess]);

  // Show error notification when auth error changes
  useEffect(() => {
    if (error) {
      showError(error, "Authentication Error");
    }
  }, [error, showError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const resultAction = await dispatch(
        loginUser({
          email: formData.email,
          password: formData.password,
        })
      ).unwrap();

      if (resultAction) {
        showSuccess("Logged in successfully!", "Welcome Back");
        navigate("/app");
      }
    } catch (error) {
      // Error is handled by the auth slice and displayed via the useEffect above
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden deep-space-bg">
      {/* Subtle background elements - matching landing page style */}
      {backgroundElements.map((element) => (
        <div
          key={element.id}
          className="absolute rounded-full"
          style={{
            width: `${element.size}px`,
            height: `${element.size}px`,
            left: `${element.x}%`,
            top: `${element.y}%`,
            background:
              element.id % 3 === 0
                ? `radial-gradient(circle, rgba(156, 90, 255, ${
                    element.opacity * 1.2
                  }) 0%, rgba(40, 40, 40, ${element.opacity * 0.7}) 100%)`
                : element.id % 2 === 0
                ? `radial-gradient(circle, rgba(90, 158, 255, ${
                    element.opacity * 1.2
                  }) 0%, rgba(20, 20, 20, ${element.opacity * 0.7}) 100%)`
                : `radial-gradient(circle, rgba(80, 80, 80, ${
                    element.opacity * 1.5
                  }) 0%, rgba(10, 10, 10, ${element.opacity * 0.5}) 100%)`,
            filter: "blur(60px)",
            animationDelay: `${element.delay}s`,
            animation: "subtle-pulse 15s ease-in-out infinite",
          }}
        />
      ))}

      {/* Navigation - fixed at the top with glass effect - matching landing page */}
      <div className="navbar-container navbar-glass">
        <div className="app-container h-full mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="block">
              <div className="app-logo text-4xl lg:text-5xl font-bold tracking-tight">
                ArtiCube
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content container with proper spacing from navbar - matching landing page */}
      <main className="main-content">
        <div className="app-container">
          {/* Concise header */}
          <section className="mb-8 mt-6 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 siri-heading">
              Welcome Back!
            </h1>
          </section>

          {/* Simple login form with glassmorphism */}
          <section className="mb-16 flex justify-center">
            <div className="auth-form-container">
              <div className="glass glass-card rounded-2xl w-full p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-bold siri-heading">Sign In</h3>
                  <div className="text-sm support-button">
                    <span className="siri-text-subtle mr-2">New user?</span>
                    <Link to="/register" className="auth-link">
                      Create account
                    </Link>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="error-container mb-6">
                      <ErrorMessage error={error} />
                    </div>
                  )}

                  <div className="auth-form-group">
                    <label className="auth-form-label" htmlFor="email">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      className="auth-form-input"
                    />
                  </div>

                  <div className="auth-form-group">
                    <div className="flex items-center justify-between">
                      <label className="auth-form-label" htmlFor="password">
                        Password
                      </label>
                      <a href="#" className="auth-link text-xs">
                        Forgot password?
                      </a>
                    </div>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••••"
                      className="auth-form-input"
                    />
                  </div>

                  <div className="remember-me-container">
                    <input
                      type="checkbox"
                      id="remember-me"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="remember-me-checkbox"
                    />
                    <label htmlFor="remember-me" className="remember-me-label">
                      Remember me
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="glass-auth-button"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <span className="mr-2 animate-pulse">●</span> Signing
                        in...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center text-sm siri-text-subtle back-to-landing">
                  <Link to="/" className="auth-link">
                    Back to landing page
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer - matching landing page */}
        <footer className="glass-footer py-8">
          <div className="app-container">
            <div className="text-center siri-text-subtle text-sm">
              <p className="flex items-center justify-center">
                © {new Date().getFullYear()} Made with
                <span className="heart-icon mx-2">❤</span> by hitesh
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default LoginPage;
