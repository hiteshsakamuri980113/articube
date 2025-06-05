import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { useNotification } from "../hooks/useNotification";
import { registerUser, clearError } from "../store/slices/authSlice";
import ErrorMessage from "../components/common/ErrorMessage";
import "../styles/glassmorphism.css";
import "../styles/siri-text.css";
import "../styles/common-pages.css";
import "../styles/text-utilities.css";
import AppFooter from "../components/common/AppFooter";

const RegisterPage: React.FC = () => {
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
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [formErrors, setFormErrors] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  const { showSuccess, showError } = useNotification();

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

    // If user is already authenticated, redirect to home
    if (isAuthenticated) {
      navigate("/app");
    }
  }, [dispatch, isAuthenticated, navigate]);

  // Show error notification when auth error changes
  useEffect(() => {
    if (error) {
      showError(error, "Registration Error");
    }
  }, [error, showError]);

  const validateForm = () => {
    let valid = true;
    const errors = {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    };

    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
      valid = false;
    }

    // Username validation
    if (!formData.username) {
      errors.username = "Username is required";
      valid = false;
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
      valid = false;
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
      valid = false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError(
        "Please correct the form errors before submitting",
        "Form Validation"
      );
      return;
    }

    try {
      const result = await dispatch(
        registerUser({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName || undefined,
        })
      );

      if (registerUser.fulfilled.match(result)) {
        // Show success notification before redirecting
        showSuccess(
          "Account created successfully! Please log in.",
          "Registration Complete"
        );
        // Registration successful, redirect to login
        navigate("/login", { state: { registered: true } });
      }
    } catch (err) {
      // Error will be shown via the useEffect hook that watches the error state
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
              Join ArtiCube!
            </h1>
          </section>

          {/* Simple register form with glassmorphism */}
          <section className="mb-16 flex justify-center">
            <div className="auth-form-container">
              <div className="glass glass-card rounded-2xl w-full p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-bold siri-heading">
                    Create Account
                  </h3>
                  <div className="text-sm support-button">
                    <span className="siri-text-subtle mr-2">
                      Already a member?
                    </span>
                    <Link to="/login" className="auth-link">
                      Sign in
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
                    <label className="auth-form-label" htmlFor="fullName">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="auth-form-input"
                    />
                  </div>

                  <div className="auth-form-group">
                    <label className="auth-form-label" htmlFor="username">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      placeholder="Choose a username"
                      className="auth-form-input"
                    />
                    {formErrors.username && (
                      <div className="form-error">{formErrors.username}</div>
                    )}
                  </div>

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
                    {formErrors.email && (
                      <div className="form-error">{formErrors.email}</div>
                    )}
                  </div>

                  <div className="auth-form-group">
                    <label className="auth-form-label" htmlFor="password">
                      Password
                    </label>
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
                    {formErrors.password && (
                      <div className="form-error">{formErrors.password}</div>
                    )}
                  </div>

                  <div className="auth-form-group">
                    <label
                      className="auth-form-label"
                      htmlFor="confirmPassword"
                    >
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="••••••••••"
                      className="auth-form-input"
                    />
                    {formErrors.confirmPassword && (
                      <div className="form-error">
                        {formErrors.confirmPassword}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="glass-auth-button mt-4"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <span className="mr-2 animate-pulse">●</span> Creating
                        Account...
                      </span>
                    ) : (
                      "Create Account"
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
        <AppFooter />
      </main>
    </div>
  );
};

export default RegisterPage;
