import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Bug, Home } from 'lucide-react';
import { performanceMonitor } from '@/lib/performance';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolate?: boolean; // Whether to isolate this boundary from parent boundaries
  retryable?: boolean; // Whether to show retry button
  level?: 'page' | 'section' | 'component'; // Error boundary level
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  errorId: string;
}

export class AdvancedErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log error with performance context
    this.logError(error, errorInfo);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Report to error tracking service
    this.reportError(error, errorInfo);
  }

  private logError(error: Error, errorInfo: ErrorInfo) {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundaryLevel: this.props.level || 'unknown',
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      performanceMetrics: performanceMonitor.getSummary(),
    };

    console.group(`🚨 Error Boundary (${this.props.level || 'unknown'})`);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Context:', errorDetails);
    console.groupEnd();

    // Store error in session storage for debugging
    try {
      const existingErrors = JSON.parse(sessionStorage.getItem('error_log') || '[]');
      existingErrors.push(errorDetails);
      // Keep only last 10 errors
      if (existingErrors.length > 10) {
        existingErrors.splice(0, existingErrors.length - 10);
      }
      sessionStorage.setItem('error_log', JSON.stringify(existingErrors));
    } catch (e) {
      console.warn('Failed to store error in session storage:', e);
    }
  }

  private async reportError(error: Error, errorInfo: ErrorInfo) {
    try {
      // Report to error tracking service (e.g., Sentry, LogRocket, etc.)
      const errorReport = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        level: this.props.level,
        retryCount: this.state.retryCount,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: localStorage.getItem('user_id'), // If available
        sessionId: sessionStorage.getItem('session_id'), // If available
      };

      // Send to your error reporting endpoint
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport),
      }).catch(() => {
        // Silently fail if error reporting fails
      });
    } catch (e) {
      console.warn('Failed to report error:', e);
    }
  }

  private handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));

    // Clear any existing retry timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    // Auto-retry with exponential backoff for certain errors
    if (this.isRetryableError(this.state.error)) {
      const delay = Math.pow(2, this.state.retryCount) * 1000; // 1s, 2s, 4s, etc.
      this.retryTimeoutId = setTimeout(() => {
        this.handleRetry();
      }, delay);
    }
  };

  private isRetryableError(error: Error | null): boolean {
    if (!error) return false;
    
    // Network errors, timeout errors, etc.
    const retryablePatterns = [
      /network/i,
      /timeout/i,
      /fetch/i,
      /loading chunk \d+ failed/i,
    ];

    return retryablePatterns.some(pattern => pattern.test(error.message));
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  private renderErrorFallback() {
    const { error, errorInfo, retryCount, errorId } = this.state;
    const { level = 'component', retryable = true } = this.props;

    // Custom fallback provided
    if (this.props.fallback) {
      return this.props.fallback;
    }

    // Different UI based on error boundary level
    switch (level) {
      case 'page':
        return this.renderPageError();
      case 'section':
        return this.renderSectionError();
      default:
        return this.renderComponentError();
    }
  }

  private renderPageError() {
    const { error, retryCount } = this.state;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                We encountered an unexpected error. Our team has been notified and is working on a fix.
              </p>
              
              {error && (
                <details className="text-xs text-gray-500">
                  <summary className="cursor-pointer hover:text-gray-700">
                    Technical details
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                    {error.message}
                  </pre>
                </details>
              )}

              <div className="flex flex-col space-y-2">
                {retryCount < this.maxRetries && (
                  <Button onClick={this.handleRetry} className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again ({this.maxRetries - retryCount} attempts left)
                  </Button>
                )}
                
                <Button onClick={this.handleReload} variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                
                <Button onClick={this.handleGoHome} variant="outline" className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Error ID: {this.state.errorId}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  private renderSectionError() {
    const { error, retryCount } = this.state;
    
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center text-red-800">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Section Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-700 mb-4">
            This section failed to load properly.
          </p>
          
          {error && (
            <details className="text-xs text-red-600 mb-4">
              <summary className="cursor-pointer hover:text-red-800">
                Error details
              </summary>
              <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto">
                {error.message}
              </pre>
            </details>
          )}

          <div className="flex space-x-2">
            {retryCount < this.maxRetries && (
              <Button onClick={this.handleRetry} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            )}
            
            <Button onClick={this.handleReload} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-1" />
              Reload
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  private renderComponentError() {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center">
          <Bug className="h-4 w-4 text-red-500 mr-2" />
          <span className="text-sm text-red-700">Component failed to render</span>
          {this.state.retryCount < this.maxRetries && (
            <Button
              onClick={this.handleRetry}
              size="sm"
              variant="ghost"
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.renderErrorFallback();
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => (
    <AdvancedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} ref={ref} />
    </AdvancedErrorBoundary>
  ));

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for error reporting
export function useErrorReporting() {
  const reportError = React.useCallback((error: Error, context?: Record<string, any>) => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Report to your error tracking service
    fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorReport),
    }).catch(() => {
      // Silently fail
    });
  }, []);

  return { reportError };
}
