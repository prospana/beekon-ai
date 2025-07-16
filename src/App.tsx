import { WorkspaceErrorBoundary } from "@/components/WorkspaceErrorBoundary";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { WorkspaceProvider } from "./hooks/useWorkspace";

// Lazy load all pages for code splitting
const Analysis = lazy(() => import("./pages/Analysis"));
const Auth = lazy(() => import("./pages/Auth"));
const Competitors = lazy(() => import("./pages/Competitors"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Settings = lazy(() => import("./pages/Settings"));
const Websites = lazy(() => import("./pages/Websites"));

const queryClient = new QueryClient();

const App = () => (
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

export default App;
