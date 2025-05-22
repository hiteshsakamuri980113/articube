import React from "react";

interface ErrorMessageProps {
  error: unknown;
  className?: string;
}

/**
 * A component to safely display error messages
 * Handles different error formats and ensures they are displayed as strings
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  className = "",
}) => {
  // If there's no error, don't render anything
  if (!error) {
    return null;
  }

  // Convert error to string based on its type
  const getErrorMessage = (): string => {
    // Handle string errors
    if (typeof error === "string") {
      return error;
    }

    // Handle Error objects
    if (error instanceof Error) {
      return error.message;
    }

    // Handle objects with message or detail properties
    if (typeof error === "object" && error !== null) {
      // @ts-ignore - We're checking for existence at runtime
      if (error.message) {
        // @ts-ignore
        return error.message;
      }

      // @ts-ignore
      if (error.detail) {
        // @ts-ignore
        if (typeof error.detail === "string") {
          // @ts-ignore
          return error.detail;
        }

        // @ts-ignore
        if (typeof error.detail === "object" && error.detail.msg) {
          // @ts-ignore
          return error.detail.msg;
        }

        try {
          // @ts-ignore
          return JSON.stringify(error.detail);
        } catch (e) {
          // If stringify fails, fall back
        }
      }

      // Try to stringify the whole object
      try {
        return JSON.stringify(error);
      } catch (e) {
        // If stringify fails, fall back
      }
    }

    // Fallback for any other type
    return "An unexpected error occurred";
  };

  return (
    <div
      className={`text-red-600 w-full box-sizing-border-box overflow-wrap-break-word ${className}`}
    >
      {getErrorMessage()}
    </div>
  );
};

export default ErrorMessage;
