/**
 * Utilities for handling API responses and errors
 */

/**
 * Handle API errors by extracting error messages from the response
 * This handles various error formats that might come from the backend
 *
 * @param response - The fetch Response object
 * @param defaultMessage - Default message to show if error cannot be parsed
 * @returns A string error message
 */
export async function handleApiError(
  response: Response,
  defaultMessage: string
): Promise<string> {
  try {
    // Try to parse response as JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json();
      return extractErrorMessage(errorData, defaultMessage);
    }

    // For non-JSON responses, try to get text
    const textError = await response.text();
    return (
      textError ||
      `${response.status}: ${response.statusText}` ||
      defaultMessage
    );
  } catch (error) {
    console.error("Error parsing API error response:", error);
    return defaultMessage;
  }
}

/**
 * Extract error message from API error response
 * Handles various error formats and converts them to readable strings
 */
export const extractErrorMessage = (
  errorData: any,
  defaultMessage: string = "An error occurred"
): string => {
  if (!errorData) {
    return defaultMessage;
  }

  // Handle object with detail property (most FastAPI errors)
  if (errorData.detail) {
    // If detail is a string
    if (typeof errorData.detail === "string") {
      return errorData.detail;
    }

    // If detail is an object with msg property (validation errors)
    if (typeof errorData.detail === "object" && errorData.detail.msg) {
      return errorData.detail.msg;
    }

    // If detail is an array (multiple validation errors)
    if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
      // Try to extract messages and join them
      const messages = errorData.detail
        .map((err: any) => err.msg || (typeof err === "string" ? err : null))
        .filter(Boolean);

      if (messages.length > 0) {
        return messages.join("; ");
      }
    }

    // Last resort: stringify the detail object
    return JSON.stringify(errorData.detail);
  }

  // Handle error with message property
  if (errorData.message) {
    return errorData.message;
  }

  // If errorData is a string
  if (typeof errorData === "string") {
    return errorData;
  }

  // Last resort: stringify the whole error
  try {
    return JSON.stringify(errorData);
  } catch (e) {
    return defaultMessage;
  }
};

// The handleApiError function is already defined above
