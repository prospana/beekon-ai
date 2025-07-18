import { WorkspaceErrorBoundary } from "@/components/WorkspaceErrorBoundary";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { WorkspaceProvider } from "./hooks/useWorkspace";
import { registerSW } from "./lib/serviceWorker";

// Lazy load all pages for code splitting
const Analysis = lazy(() => import("./pages/Analysis"));
const Auth = lazy(() => import("./pages/Auth"));
const Competitors = lazy(() => import("./pages/Competitors"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Settings = lazy(() => import("./pages/Settings"));
const Websites = lazy(() => import("./pages/Websites"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = error.status as number;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => {
  useEffect(() => {
    // Initialize service worker
    try {
      registerSW();
    } catch (error) {
      console.warn('Service worker registration failed:', error);
    }
    
    // Initialize performance monitoring with error handling
    const initPerformanceMonitoring = async () => {
      try {
        const { performanceMonitor } = await import('./lib/performance');
        performanceMonitor.startTiming('app-initialization');
        
        // Return cleanup function
        return () => {
          try {
            performanceMonitor.endTiming('app-initialization');
          } catch (error) {
            console.warn('Performance monitoring cleanup failed:', error);
          }
        };
      } catch (error) {
        console.warn('Main performance monitoring failed, using fallback:', error);
        try {
          // Use fallback performance monitor
          const { fallbackPerformanceMonitor } = await import('./lib/performance-fallback');
          fallbackPerformanceMonitor.startTiming('app-initialization');
          
          return () => {
            try {
              fallbackPerformanceMonitor.endTiming('app-initialization');
            } catch (fallbackError) {
              console.warn('Fallback performance monitoring cleanup failed:', fallbackError);
            }
          };
        } catch (fallbackError) {
          console.warn('Fallback performance monitoring also failed:', fallbackError);
          return () => {}; // Return empty cleanup function
        }
      }
    };
    
    let cleanup: (() => void) | undefined;
    
    // Initialize performance monitoring
    initPerformanceMonitoring().then(cleanupFn => {
      cleanup = cleanupFn;
    });
    
    // Preload critical resources
    const criticalUrls = [
      '/api/workspaces',
      '/api/websites',
      '/api/dashboard/metrics',
    ];
    
    // Preload URLs after a short delay to not block initial render
    setTimeout(() => {
      criticalUrls.forEach(url => {
        fetch(url, { method: 'GET' }).catch(() => {
          // Ignore errors, this is just preloading
        });
      });
    }, 1000);
    
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <WorkspaceErrorBoundary>
            <WorkspaceProvider>
              <BrowserRouter>
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>}>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <Dashboard />
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/websites"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <Websites />
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/analysis"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                              <Analysis />
                            </Suspense>
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/competitors"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                              <Competitors />
                            </Suspense>
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <Settings />
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </WorkspaceProvider>
          </WorkspaceErrorBoundary>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
