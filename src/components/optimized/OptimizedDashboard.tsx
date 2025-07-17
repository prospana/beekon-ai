import React, { Suspense, memo, useMemo, useCallback, startTransition } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useOptimizedDashboardData } from "@/hooks/useOptimizedDashboard";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, TrendingUp, TrendingDown } from "lucide-react";
import { withPerformanceMonitoring } from "@/lib/performance";

interface DashboardProps {
  dateFilter: "7d" | "30d" | "90d";
  onDateFilterChange: (filter: "7d" | "30d" | "90d") => void;
}

// Memoized metric card component
const MetricCard = memo<{
  title: string;
  value: number | string;
  trend?: number;
  format?: 'number' | 'percentage' | 'currency';
  icon?: React.ReactNode;
}>(({ title, value, trend, format = 'number', icon }) => {
  const formattedValue = useMemo(() => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'percentage':
        return `${value}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD' 
        }).format(value);
      default:
        return new Intl.NumberFormat('en-US').format(value);
    }
  }, [value, format]);

  const trendIcon = useMemo(() => {
    if (trend === undefined) return null;
    return trend > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : trend < 0 ? (
      <TrendingDown className="h-4 w-4 text-red-500" />
    ) : null;
  }, [trend]);

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-bold">{formattedValue}</div>
          {trendIcon}
          {trend !== undefined && (
            <span className={`text-sm ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-500'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

MetricCard.displayName = 'MetricCard';

// Memoized chart components with lazy loading
const LazyVisibilityChart = React.lazy(() => 
  import("@/components/dashboard/VisibilityChart").then(module => ({
    default: memo(module.VisibilityChart)
  }))
);

const LazyMentionTrendChart = React.lazy(() => 
  import("@/components/DashboardCharts").then(module => ({
    default: memo(module.MentionTrendChart)
  }))
);

const LazyTopicRadarChart = React.lazy(() => 
  import("@/components/DashboardCharts").then(module => ({
    default: memo(module.TopicRadarChart)
  }))
);

// Loading fallback component
const ChartSkeleton = memo(() => (
  <Card>
    <CardHeader>
      <div className="h-4 bg-gray-200 rounded animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="h-64 bg-gray-100 rounded animate-pulse" />
    </CardContent>
  </Card>
));

ChartSkeleton.displayName = 'ChartSkeleton';

// Error fallback component
const ChartErrorFallback = memo<{ error: Error; resetErrorBoundary: () => void }>(
  ({ error, resetErrorBoundary }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-red-500">Chart Error</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Failed to load chart: {error.message}
        </p>
        <Button onClick={resetErrorBoundary} variant="outline" size="sm">
          Retry
        </Button>
      </CardContent>
    </Card>
  )
);

ChartErrorFallback.displayName = 'ChartErrorFallback';

// Main dashboard component with optimizations
const OptimizedDashboard = memo<DashboardProps>(({ dateFilter, onDateFilterChange }) => {
  const { currentWorkspace, websites } = useWorkspace();
  
  const filters = useMemo(() => ({
    period: dateFilter,
  }), [dateFilter]);

  // Use optimized dashboard hook with suspense
  const {
    metrics,
    timeSeriesData,
    topicPerformance,
    llmPerformance,
    websitePerformance,
    isRefreshing,
    refreshData,
    prefetchRelatedData,
    hasData,
  } = useOptimizedDashboardData(filters);

  // Memoized metric cards data
  const metricCards = useMemo(() => [
    {
      title: "Overall Visibility",
      value: metrics.overallVisibilityScore,
      trend: metrics.improvementTrend,
      format: 'percentage' as const,
      icon: <TrendingUp className="h-4 w-4 text-blue-500" />,
    },
    {
      title: "Average Ranking",
      value: metrics.averageRanking,
      format: 'number' as const,
    },
    {
      title: "Total Mentions",
      value: metrics.totalMentions,
      format: 'number' as const,
    },
    {
      title: "Sentiment Score",
      value: metrics.sentimentScore,
      format: 'percentage' as const,
    },
  ], [metrics]);

  // Optimized refresh handler with transitions
  const handleRefresh = useCallback(() => {
    startTransition(() => {
      refreshData(true);
    });
  }, [refreshData]);

  // Prefetch data on hover for better UX
  const handlePrefetch = useCallback(() => {
    prefetchRelatedData();
  }, [prefetchRelatedData]);

  // Memoized date filter handler
  const handleDateFilterChange = useCallback((newFilter: "7d" | "30d" | "90d") => {
    startTransition(() => {
      onDateFilterChange(newFilter);
    });
  }, [onDateFilterChange]);

  if (!currentWorkspace || !websites?.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">No Workspace Found</h3>
          <p className="text-gray-600">Please create a workspace to view dashboard data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" onMouseEnter={handlePrefetch}>
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-4">
          {/* Date filter buttons */}
          <div className="flex items-center space-x-2">
            {(['7d', '30d', '90d'] as const).map((period) => (
              <Button
                key={period}
                variant={dateFilter === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDateFilterChange(period)}
              >
                {period}
              </Button>
            ))}
          </div>
          
          {/* Refresh button */}
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, index) => (
          <MetricCard key={index} {...card} />
        ))}
      </div>

      {/* Charts with error boundaries and suspense */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ErrorBoundary FallbackComponent={ChartErrorFallback}>
          <Suspense fallback={<ChartSkeleton />}>
            <LazyVisibilityChart data={timeSeriesData} />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary FallbackComponent={ChartErrorFallback}>
          <Suspense fallback={<ChartSkeleton />}>
            <LazyMentionTrendChart data={timeSeriesData} />
          </Suspense>
        </ErrorBoundary>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ErrorBoundary FallbackComponent={ChartErrorFallback}>
          <Suspense fallback={<ChartSkeleton />}>
            <LazyTopicRadarChart data={topicPerformance} />
          </Suspense>
        </ErrorBoundary>

        {/* Additional charts can be added here */}
      </div>

      {/* Empty state */}
      {!hasData && (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-gray-600">Start analyzing your websites to see dashboard data.</p>
          </div>
        </div>
      )}
    </div>
  );
});

OptimizedDashboard.displayName = 'OptimizedDashboard';

// Export with performance monitoring
export default withPerformanceMonitoring(OptimizedDashboard, 'OptimizedDashboard');
