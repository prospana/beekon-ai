import { WorkspaceErrorBoundary } from "@/components/WorkspaceErrorBoundary";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { AuthProvider } from "@/hooks/useAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Analysis from "./pages/Analysis";
import Auth from "./pages/Auth";
import Competitors from "./pages/Competitors";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Websites from "./pages/Websites";

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
                        <Analysis />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/competitors"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Competitors />
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
            </BrowserRouter>
          </WorkspaceProvider>
        </WorkspaceErrorBoundary>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
