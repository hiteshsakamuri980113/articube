import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import Card from "./Card";
import Button from "./Button";
import ErrorMessage from "./ErrorMessage";
import GlobalErrorFallback from "../../pages/GlobalErrorFallback";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can also log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // For root level errors, use the GlobalErrorFallback
      if (
        !this.state.errorInfo ||
        !this.state.errorInfo.componentStack ||
        !this.state.errorInfo.componentStack.includes(" (created by ")
      ) {
        return (
          <GlobalErrorFallback
            error={this.state.error || undefined}
            resetErrorBoundary={this.handleReset}
          />
        );
      }

      // Default fallback UI for component-level errors
      return (
        <Card className="p-6 max-w-md mx-auto my-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Component Error
            </h2>

            <p className="mb-4 text-ios-gray-700 dark:text-ios-gray-300">
              We're sorry, but an error occurred while displaying this content.
            </p>

            <Button
              onClick={this.handleReset}
              variant="primary"
              className="mb-4"
            >
              Try again
            </Button>

            {process.env.NODE_ENV !== "production" && this.state.error && (
              <div className="mt-4 text-left">
                <p className="font-semibold text-red-500">Error:</p>
                <ErrorMessage error={this.state.error} className="my-2" />
                <pre className="bg-ios-gray-100 dark:bg-ios-gray-800 p-2 rounded-md overflow-auto text-sm mt-2">
                  {this.state.error.toString()}
                </pre>

                {this.state.errorInfo && (
                  <>
                    <p className="font-semibold text-red-500 mt-4">
                      Component Stack:
                    </p>
                    <pre className="bg-ios-gray-100 dark:bg-ios-gray-800 p-2 rounded-md overflow-auto text-sm mt-2">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            )}
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
