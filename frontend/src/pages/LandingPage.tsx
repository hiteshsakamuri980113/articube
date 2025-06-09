import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/glassmorphism.css";
import "../styles/grid-fixes.css";
import "../styles/navbar-scroll.css";
import "../styles/siri-text.css";
import "../styles/section-spacing.css";
import "../styles/deep-space-bg.css";
import "../styles/footer-styles.css";
import "../styles/tech-stack-responsive.css";
import AppFooter from "../components/common/AppFooter";

// Icon Components
const AIIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21a48.309 48.309 0 01-8.135-0.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const CodeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
    />
  </svg>
);

const GithubIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

// Main component
const LandingPage = () => {
  // State for subtle animated background elements
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

  // State to track scroll position for navbar styling
  const [scrolled, setScrolled] = useState(false);

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

    // Add scroll event listener
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup the listener
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Subtle background elements */}
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

      {/* Navigation - fixed at the top with scroll effect */}
      <div
        className={`navbar-container navbar-glass ${
          scrolled ? "navbar-scroll" : ""
        }`}
      >
        <div className="app-container h-full mx-auto flex justify-between items-center px-4">
          <div className="flex items-center h-full">
            <Link to="/" className="flex items-center h-full">
              <div className="app-logo text-4xl lg:text-5xl font-bold tracking-tight animated-gradient-text">
                ArtiCube
              </div>
            </Link>
          </div>
          <div className="flex items-center h-full gap-4 navbar-buttons">
            <a
              href="https://github.com/hiteshsakamuri/articube"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-button text-white flex items-center justify-center gap-2 text-sm"
            >
              <GithubIcon className="h-4 w-4" /> GitHub
            </a>
            <Link
              to="/login"
              className="nav-button nav-button-primary flex items-center justify-center gap-2 text-sm"
            >
              View Demo
            </Link>
          </div>
        </div>
      </div>

      {/* Main content container with proper spacing from navbar */}
      <main className="main-content">
        <div className="app-container">
          {/* Hero Section - Portfolio Focus */}
          <section className="mb-32 mt-20">
            <div className="flex flex-col items-center text-center">
              <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight siri-heading text-gradient">
                  Personalized AI Knowledge Assistant
                </h1>
                <p className="text-lg siri-text-subtle mb-8 leading-relaxed">
                  An AI-powered knowledge assistant built with React,
                  TypeScript, and Python. Powered to fetch true and accurate
                  information on your query from the most trusted sources.
                </p>
                <div className="flex flex-row justify-center gap-4 flex-wrap">
                  <Link
                    to="/login"
                    className="simple-button primary-button rounded-lg flex items-center justify-center gap-2 text-sm"
                  >
                    Try the Demo
                  </Link>
                  <a
                    href="https://github.com/hiteshsakamuri/articube"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="simple-button secondary-button rounded-lg flex items-center justify-center gap-2 text-sm"
                  >
                    View Code
                  </a>
                </div>
              </div>
            </div>
          </section>

          <div className="section-divider"></div>

          {/* Technical Features Section */}
          <section className="mb-32 mt-20">
            <h2 className="text-2xl font-bold mb-12 siri-heading section-title animated-gradient-text">
              Technical Features
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md-grid-fix">
              {/* AI Integration */}
              <div className="glass glass-card glass-shine p-7 rounded-2xl content-block">
                <div className="glass-list-icon glass-purple mb-5 flex items-center justify-center">
                  <AIIcon />
                </div>
                <h3 className="text-xl font-semibold mb-3 siri-heading text-gradient">
                  AI Agent Integration
                </h3>
                <p className="siri-text-subtle text-sm leading-relaxed">
                  Google ADK-powered Gemini agent with sequential architecture
                  for accurate information retrieval and source attribution
                  tracking.
                </p>
              </div>

              {/* React/TypeScript */}
              <div className="glass glass-card glass-shine p-7 rounded-2xl content-block">
                <div className="glass-list-icon glass-blue mb-5 flex items-center justify-center">
                  <CodeIcon />
                </div>
                <h3 className="text-xl font-semibold mb-3 siri-heading text-gradient">
                  Modern Frontend
                </h3>
                <p className="siri-text-subtle text-sm leading-relaxed">
                  React.js with TypeScript, Redux Toolkit for state management,
                  and custom glassmorphism UI components with animations and
                  transitions.
                </p>
              </div>

              {/* Interactive Search */}
              <div className="glass glass-card glass-shine p-7 rounded-2xl content-block">
                <div className="glass-list-icon glass-indigo mb-5 flex items-center justify-center">
                  <SearchIcon />
                </div>
                <h3 className="text-xl font-semibold mb-3 siri-heading text-gradient">
                  Interactive Search
                </h3>
                <p className="siri-text-subtle text-sm leading-relaxed">
                  Performance-optimized search with glass UI modal, keyboard
                  navigation, and MongoDB-backed search history with source
                  attribution.
                </p>
              </div>
            </div>
          </section>

          <div className="section-divider"></div>

          {/* Tech Stack Section */}
          <section className="mb-32 mt-20">
            <div className="glass glass-card p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-10 siri-heading section-title animated-gradient-text w-fit">
                Tech Stack
              </h2>

              <div className="tech-stack-container">
                <div className="tech-stack-item">
                  <h3 className="text-base font-semibold siri-heading mb-3 text-gradient">
                    Frontend
                  </h3>
                  <ul className="siri-text-subtle text-sm space-y-2">
                    <li>
                      <span className="dot"></span>
                      React 19
                    </li>
                    <li>
                      <span className="dot"></span>
                      TypeScript 5
                    </li>
                    <li>
                      <span className="dot"></span>
                      Redux Toolkit
                    </li>
                    <li>
                      <span className="dot"></span>
                      TailwindCSS
                    </li>
                    <li>
                      <span className="dot"></span>
                      Vite
                    </li>
                    <li>
                      <span className="dot"></span>
                      Jest & React Testing Library
                    </li>
                  </ul>
                </div>

                <div className="tech-stack-item">
                  <h3 className="text-base font-semibold siri-heading mb-3 text-gradient">
                    Backend
                  </h3>
                  <ul className="siri-text-subtle text-sm space-y-2">
                    <li>
                      <span className="dot"></span>
                      FastAPI
                    </li>
                    <li>
                      <span className="dot"></span>
                      Python 3.11
                    </li>
                    <li>
                      <span className="dot"></span>
                      MongoDB
                    </li>
                    <li>
                      <span className="dot"></span>
                      PyJWT
                    </li>
                    <li>
                      <span className="dot"></span>
                      Pydantic
                    </li>
                    <li>
                      <span className="dot"></span>
                      Uvicorn
                    </li>
                  </ul>
                </div>

                <div className="tech-stack-item">
                  <h3 className="text-base font-semibold siri-heading mb-3 text-gradient">
                    AI Integration
                  </h3>
                  <ul className="siri-text-subtle text-sm space-y-2">
                    <li>
                      <span className="dot"></span>
                      Google ADK
                    </li>
                    <li>
                      <span className="dot"></span>
                      Gemini
                    </li>
                    <li>
                      <span className="dot"></span>
                      Sequential Agent Architecture
                    </li>
                    <li>
                      <span className="dot"></span>
                      Google Search Integration
                    </li>
                    <li>
                      <span className="dot"></span>
                      Source Attribution
                    </li>
                    <li>
                      <span className="dot"></span>
                      In-Memory Session Service
                    </li>
                  </ul>
                </div>

                <div className="tech-stack-item">
                  <h3 className="text-base font-semibold siri-heading mb-3 text-gradient">
                    DevOps
                  </h3>
                  <ul className="siri-text-subtle text-sm space-y-2">
                    <li>
                      <span className="dot"></span>
                      Environment Configuration
                    </li>
                    <li>
                      <span className="dot"></span>
                      Cross-Origin Resource Sharing
                    </li>
                    <li>
                      <span className="dot"></span>
                      GitHub Repository
                    </li>
                    <li>
                      <span className="dot"></span>
                      Vite Dev Server
                    </li>
                    <li>
                      <span className="dot"></span>
                      Environment Variables
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <div className="section-divider"></div>

          {/* Implementation Highlights */}
          <section className="mb-32 mt-20">
            <h2 className="text-2xl font-bold mb-12 siri-heading section-title animated-gradient-text">
              Implementation Highlights
            </h2>

            <div className="glass glass-card p-8 rounded-2xl content-block">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold siri-heading mb-4 text-gradient">
                    UI Features
                  </h3>
                  <ul className="siri-text-subtle text-sm space-y-3">
                    <li>
                      <span className="dot"></span>
                      Performance-optimized search modal with hardware
                      acceleration
                    </li>
                    <li>
                      <span className="dot"></span>
                      Glassmorphism design system with fluid animations
                    </li>
                    <li>
                      <span className="dot"></span>
                      Virtualized scrolling with scroll snap for touch devices
                    </li>
                    <li>
                      <span className="dot"></span>
                      Advanced performance monitoring and optimizations
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold siri-heading mb-4 text-gradient">
                    Backend Features
                  </h3>
                  <ul className="siri-text-subtle text-sm space-y-3">
                    <li>
                      <span className="dot"></span>
                      Async FastAPI with MongoDB for scalable data storage
                    </li>
                    <li>
                      <span className="dot"></span>
                      Sequential LLM agent architecture with Google ADK
                    </li>
                    <li>
                      <span className="dot"></span>
                      Robust error handling with session state recovery
                    </li>
                    <li>
                      <span className="dot"></span>
                      JWT authentication with secure user management
                    </li>
                  </ul>
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

export default LandingPage;
