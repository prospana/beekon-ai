import { useSuspenseQuery, useSuspenseQueries, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "./useWorkspace";
import { optimizedDashboardService } from "@/services/optimized-dashboard-service";
import { useMemo, useCallback } from "react";

export interface DashboardFilters {
  dateRange?: { start: string; end: string };
  period: "7d" | "30d" | "90d";
}

// Optimized query keys with better cache invalidation
export const optimizedDashboardKeys = {
  all: ['dashboard-v2'] as const,
  metrics: (websiteIds: string[], dateRange?: { start: string; end: string }) => 
    [...optimizedDashboardKeys.all, 'metrics', websiteIds.sort(), dateRange] as const,
  allData: (websiteIds: string[], filters: DashboardFilters) => 
    [...optimizedDashboardKeys.all, 'allData', websiteIds.sort(), filters] as const,
  timeSeries: (websiteIds: string[], period: string) => 
    [...optimizedDashboardKeys.all, 'timeSeries', websiteIds.sort(), period] as const,
};

// Suspense-enabled dashboard hook for better loading states
export function useOptimizedDashboardData(filters: DashboardFilters) {
  const { websites, loading: workspaceLoading } = useWorkspace();
  const websiteIds = useMemo(() => websites?.map((w) => w.id).sort() || [], [websites]);
  
  // Use suspense query for better loading experience
  const dashboardQuery = useSuspenseQuery({
    queryKey: optimizedDashboardKeys.allData(websiteIds, filters),
    queryFn: () => optimizedDashboardService.getAllDashboardData(websiteIds, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (renamed from cacheTime)
    enabled: !workspaceLoading && websiteIds.length > 0,
  });

  const queryClient = useQueryClient();

  // Optimized refresh function with selective invalidation
  const refreshData = useCallback(async (selective = true) => {
    if (selective) {
      // Only invalidate stale data
      await queryClient.invalidateQueries({
        queryKey: optimizedDashboardKeys.all,
        refetchType: 'active',
      });
    } else {
      // Force refresh all dashboard data
      await queryClient.invalidateQueries({
        queryKey: optimizedDashboardKeys.all,
        refetchType: 'all',
      });
    }
  }, [queryClient]);

  // Prefetch related data for better UX
  const prefetchRelatedData = useCallback(() => {
    if (websiteIds.length === 0) return;

    // Prefetch next period data
    const nextPeriod = filters.period === "7d" ? "30d" : filters.period === "30d" ? "90d" : "7d";
    queryClient.prefetchQuery({
      queryKey: optimizedDashboardKeys.allData(websiteIds, { ...filters, period: nextPeriod }),
      queryFn: () => optimizedDashboardService.getAllDashboardData(websiteIds, { ...filters, period: nextPeriod }),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient, websiteIds, filters]);

  return {
    ...dashboardQuery.data,
    isLoading: false, // Suspense handles loading
    isRefreshing: dashboardQuery.isFetching,
    error: null, // Suspense handles errors
    refetch: dashboardQuery.refetch,
    refreshData,
    prefetchRelatedData,
    hasData: dashboardQuery.data.metrics.totalAnalyses > 0,
  };
}

// Individual optimized hooks for specific data
export function useOptimizedDashboardMetrics(
  websiteIds: string[],
  dateRange?: { start: string; end: string }
) {
  return useSuspenseQuery({
    queryKey: optimizedDashboardKeys.metrics(websiteIds, dateRange),
    queryFn: () => optimizedDashboardService.getDashboardMetrics(websiteIds, dateRange),
    staleTime: 2 * 60 * 1000, // 2 minutes for metrics
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Parallel queries with better error handling
export function useOptimizedDashboardQueries(filters: DashboardFilters) {
  const { websites, loading: workspaceLoading } = useWorkspace();
  const websiteIds = useMemo(() => websites?.map((w) => w.id).sort() || [], [websites]);

  const queries = useSuspenseQueries({
    queries: [
      {
        queryKey: optimizedDashboardKeys.metrics(websiteIds, filters.dateRange),
        queryFn: () => optimizedDashboardService.getDashboardMetrics(websiteIds, filters.dateRange),
        staleTime: 2 * 60 * 1000,
      },
      {
        queryKey: optimizedDashboardKeys.timeSeries(websiteIds, filters.period),
        queryFn: () => optimizedDashboardService.getTimeSeriesData(websiteIds, filters.period),
        staleTime: 5 * 60 * 1000,
      },
    ],
  });

  const [metricsQuery, timeSeriesQuery] = queries;

  return {
    metrics: metricsQuery.data,
    timeSeriesData: timeSeriesQuery.data,
    isRefreshing: queries.some((q) => q.isFetching),
    refetch: () => queries.forEach((q) => q.refetch()),
  };
}

// Hook for real-time dashboard updates
export function useRealtimeDashboard(filters: DashboardFilters) {
  const queryClient = useQueryClient();
  const { websites } = useWorkspace();
  const websiteIds = useMemo(() => websites?.map((w) => w.id).sort() || [], [websites]);

  // Set up real-time subscriptions
  const subscribeToUpdates = useCallback(() => {
    // WebSocket or Server-Sent Events for real-time updates
    const eventSource = new EventSource('/api/dashboard/stream');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Update specific cache entries based on the update type
      if (data.type === 'metrics_update') {
        queryClient.setQueryData(
          optimizedDashboardKeys.metrics(websiteIds, filters.dateRange),
          data.metrics
        );
      }
    };

    return () => eventSource.close();
  }, [queryClient, websiteIds, filters.dateRange]);

  return { subscribeToUpdates };
}

// Background data synchronization
export function useBackgroundSync() {
  const queryClient = useQueryClient();

  const syncInBackground = useCallback(async () => {
    // Get all cached dashboard queries
    const queries = queryClient.getQueryCache().findAll({
      queryKey: optimizedDashboardKeys.all,
      stale: true,
    });

    // Batch refetch stale queries
    const refetchPromises = queries.map(query => 
      queryClient.refetchQueries({
        queryKey: query.queryKey,
        type: 'active',
      })
    );

    await Promise.allSettled(refetchPromises);
  }, [queryClient]);

  return { syncInBackground };
}

// Performance monitoring for dashboard queries
export function useDashboardPerformance() {
  const queryClient = useQueryClient();

  const getPerformanceMetrics = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const dashboardQueries = cache.findAll({
      queryKey: optimizedDashboardKeys.all,
    });

    const metrics = {
      totalQueries: dashboardQueries.length,
      staleQueries: dashboardQueries.filter(q => q.isStale()).length,
      errorQueries: dashboardQueries.filter(q => q.state.error).length,
      loadingQueries: dashboardQueries.filter(q => q.state.isFetching).length,
      cacheHitRate: 0,
      averageResponseTime: 0,
    };

    // Calculate cache hit rate and response times
    const queryStates = dashboardQueries.map(q => q.state);
    const successfulQueries = queryStates.filter(s => s.data && !s.error);
    
    if (successfulQueries.length > 0) {
      metrics.cacheHitRate = (successfulQueries.length / dashboardQueries.length) * 100;
      
      const responseTimes = successfulQueries
        .filter(s => s.dataUpdatedAt && s.dataUpdatedAt > 0)
        .map(s => s.dataUpdatedAt - (s as any).fetchedAt || 0)
        .filter(t => t > 0);
      
      if (responseTimes.length > 0) {
        metrics.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      }
    }

    return metrics;
  }, [queryClient]);

  return { getPerformanceMetrics };
}
