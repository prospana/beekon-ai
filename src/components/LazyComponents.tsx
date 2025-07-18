import React, { Suspense } from "react";
import { Skeleton } from "./ui/skeleton";

// Lazy load heavy chart components
const DashboardCharts = React.lazy(() => import("./DashboardCharts"));
const AnalysisVisualization = React.lazy(() => import("./AnalysisVisualization"));
const ShareOfVoiceChart = React.lazy(() => import("./competitors/ShareOfVoiceChart"));
const CompetitiveGapChart = React.lazy(() => import("./competitors/CompetitiveGapChart"));
const TimeSeriesChart = React.lazy(() => import("./competitors/TimeSeriesChart"));

// Lazy load heavy modal components
const AnalysisConfigModal = React.lazy(() => import("./AnalysisConfigModal"));
const DetailedAnalysisModal = React.lazy(() => import("./DetailedAnalysisModal"));
const WorkspaceModal = React.lazy(() => import("./WorkspaceModal"));
const ApiKeyModal = React.lazy(() => import("./ApiKeyModal"));
const WebsiteSettingsModal = React.lazy(() => import("./WebsiteSettingsModal"));
const ProfileModal = React.lazy(() => import("./ProfileModal"));

// Skeleton components for loading states
const ChartSkeleton = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-64 w-full" />
    <div className="flex space-x-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-16" />
    </div>
  </div>
);

const ModalSkeleton = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-8 w-64" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="flex space-x-2">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-20" />
    </div>
  </div>
);

// Lazy wrapped components with loading states
export const LazyDashboardCharts = React.memo((props: any) => (
  <Suspense fallback={<ChartSkeleton />}>
    <DashboardCharts {...props} />
  </Suspense>
));

export const LazyAnalysisVisualization = React.memo((props: any) => (
  <Suspense fallback={<ChartSkeleton />}>
    <AnalysisVisualization {...props} />
  </Suspense>
));

export const LazyShareOfVoiceChart = React.memo((props: any) => (
  <Suspense fallback={<ChartSkeleton />}>
    <ShareOfVoiceChart {...props} />
  </Suspense>
));

export const LazyCompetitiveGapChart = React.memo((props: any) => (
  <Suspense fallback={<ChartSkeleton />}>
    <CompetitiveGapChart {...props} />
  </Suspense>
));

export const LazyTimeSeriesChart = React.memo((props: any) => (
  <Suspense fallback={<ChartSkeleton />}>
    <TimeSeriesChart {...props} />
  </Suspense>
));

export const LazyAnalysisConfigModal = React.memo((props: any) => (
  <Suspense fallback={<ModalSkeleton />}>
    <AnalysisConfigModal {...props} />
  </Suspense>
));

export const LazyDetailedAnalysisModal = React.memo((props: any) => (
  <Suspense fallback={<ModalSkeleton />}>
    <DetailedAnalysisModal {...props} />
  </Suspense>
));

export const LazyWorkspaceModal = React.memo((props: any) => (
  <Suspense fallback={<ModalSkeleton />}>
    <WorkspaceModal {...props} />
  </Suspense>
));

export const LazyApiKeyModal = React.memo((props: any) => (
  <Suspense fallback={<ModalSkeleton />}>
    <ApiKeyModal {...props} />
  </Suspense>
));

export const LazyWebsiteSettingsModal = React.memo((props: any) => (
  <Suspense fallback={<ModalSkeleton />}>
    <WebsiteSettingsModal {...props} />
  </Suspense>
));

export const LazyProfileModal = React.memo((props: any) => (
  <Suspense fallback={<ModalSkeleton />}>
    <ProfileModal {...props} />
  </Suspense>
));

// Higher-order component for creating lazy components
export function withLazyLoading<T extends React.ComponentType<any>>(
  Component: T,
  fallback: React.ComponentType = () => <ChartSkeleton />
) {
  const LazyComponent = React.lazy(() => Promise.resolve({ default: Component }));
  
  return React.memo((props: React.ComponentProps<T>) => (
    <Suspense fallback={React.createElement(fallback)}>
      <LazyComponent {...props} />
    </Suspense>
  ));
}

// Hook for lazy loading components conditionally
export function useLazyComponent<T extends React.ComponentType<any>>(
  componentLoader: () => Promise<{ default: T }>,
  shouldLoad: boolean = true
) {
  const [Component, setComponent] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (shouldLoad && !Component && !isLoading) {
      setIsLoading(true);
      setError(null);
      
      componentLoader()
        .then(({ default: LoadedComponent }) => {
          setComponent(() => LoadedComponent);
        })
        .catch((err) => {
          setError(err instanceof Error ? err : new Error('Failed to load component'));
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [shouldLoad, Component, isLoading, componentLoader]);

  return { Component, isLoading, error };
}

// Intersection Observer based lazy loading
export function useIntersectionLazyLoading<T extends React.ComponentType<any>>(
  componentLoader: () => Promise<{ default: T }>,
  options: IntersectionObserverInit = {}
) {
  const [Component, setComponent] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [ref, setRef] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!ref || Component || isLoading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoading(true);
          setError(null);
          
          componentLoader()
            .then(({ default: LoadedComponent }) => {
              setComponent(() => LoadedComponent);
            })
            .catch((err) => {
              setError(err instanceof Error ? err : new Error('Failed to load component'));
            })
            .finally(() => {
              setIsLoading(false);
            });
          
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, Component, isLoading, componentLoader, options]);

  return { Component, isLoading, error, ref: setRef };
}