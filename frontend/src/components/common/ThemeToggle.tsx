import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { setTheme } from "../../store/slices/uiSlice";

const ThemeToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.ui);

  // Apply theme when component mounts or theme changes
  useEffect(() => {
    const applyTheme = () => {
      // Get system preference
      const systemPreference = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      // Determine which theme to apply
      const themeToApply = theme === "system" ? systemPreference : theme;

      // Apply theme to document
      if (themeToApply === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    applyTheme();

    // Listen for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme();
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme]);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    dispatch(setTheme(newTheme));
  };

  return (
    <div className="flex items-center space-x-2 bg-ios-gray-200 dark:bg-ios-gray-800 p-1 rounded-lg">
      {/* Light mode option */}
      <button
        onClick={() => handleThemeChange("light")}
        className={`p-2 rounded-md transition-all ${
          theme === "light"
            ? "bg-white text-ios-gray-800 shadow-md"
            : "text-ios-gray-600 hover:bg-ios-gray-300 dark:text-ios-gray-400 dark:hover:bg-ios-gray-700"
        }`}
        aria-label="Light mode"
        title="Light mode"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* System mode option */}
      <button
        onClick={() => handleThemeChange("system")}
        className={`p-2 rounded-md transition-all ${
          theme === "system"
            ? "bg-white text-ios-gray-800 shadow-md dark:bg-ios-gray-700 dark:text-white"
            : "text-ios-gray-600 hover:bg-ios-gray-300 dark:text-ios-gray-400 dark:hover:bg-ios-gray-700"
        }`}
        aria-label="System theme"
        title="System theme"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dark mode option */}
      <button
        onClick={() => handleThemeChange("dark")}
        className={`p-2 rounded-md transition-all ${
          theme === "dark"
            ? "bg-ios-gray-700 text-white shadow-md"
            : "text-ios-gray-600 hover:bg-ios-gray-300 dark:text-ios-gray-400 dark:hover:bg-ios-gray-700"
        }`}
        aria-label="Dark mode"
        title="Dark mode"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </button>
    </div>
  );
};

export default ThemeToggle;
