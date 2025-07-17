import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  Clock, 
  Database, 
  Wifi, 
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import { usePerformanceMonitor, getMemoryUsage, startFPSMonitoring } from '@/lib/performance';
import { useQueryClient } from '@tanstack/react-query';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  threshold: { good: number; warning: number };
}

export function PerformanceMonitor() {
  const { metrics, vitals, getSummary, exportMetrics } = usePerformanceMonitor();
  const queryClient = useQueryClient();
  const [fps, setFps] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState<ReturnType<typeof getMemoryUsage>>(null);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');
  const [isVisible, setIsVisible] = useState(false);

  // Monitor FPS
  useEffect(() => {
    const stopFPSMonitoring = startFPSMonitoring(setFps);
    return stopFPSMonitoring;
  }, []);

  // Monitor memory usage
  useEffect(() => {
    const interval = setInterval(() => {
      setMemoryUsage(getMemoryUsage());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Performance metrics calculation
  const performanceMetrics = useMemo((): PerformanceMetric[] => {
    const summary = getSummary();
    
    return [
      {
        name: 'First Contentful Paint',
        value: vitals.FCP || 0,
        unit: 'ms',
        status: (vitals.FCP || 0) < 1500 ? 'good' : (vitals.FCP || 0) < 2500 ? 'warning' : 'critical',
        threshold: { good: 1500, warning: 2500 },
      },
      {
        name: 'Largest Contentful Paint',
        value: vitals.LCP || 0,
        unit: 'ms',
        status: (vitals.LCP || 0) < 2500 ? 'good' : (vitals.LCP || 0) < 4000 ? 'warning' : 'critical',
        threshold: { good: 2500, warning: 4000 },
      },
      {
        name: 'First Input Delay',
        value: vitals.FID || 0,
        unit: 'ms',
        status: (vitals.FID || 0) < 100 ? 'good' : (vitals.FID || 0) < 300 ? 'warning' : 'critical',
        threshold: { good: 100, warning: 300 },
      },
      {
        name: 'Cumulative Layout Shift',
        value: vitals.CLS || 0,
        unit: '',
        status: (vitals.CLS || 0) < 0.1 ? 'good' : (vitals.CLS || 0) < 0.25 ? 'warning' : 'critical',
        threshold: { good: 0.1, warning: 0.25 },
      },
      {
        name: 'Time to First Byte',
        value: vitals.TTFB || 0,
        unit: 'ms',
        status: (vitals.TTFB || 0) < 600 ? 'good' : (vitals.TTFB || 0) < 1000 ? 'warning' : 'critical',
        threshold: { good: 600, warning: 1000 },
      },
      {
        name: 'Average Response Time',
        value: summary.avgDuration,
        unit: 'ms',
        status: summary.avgDuration < 500 ? 'good' : summary.avgDuration < 1000 ? 'warning' : 'critical',
        threshold: { good: 500, warning: 1000 },
      },
      {
        name: 'Frame Rate',
        value: fps,
        unit: 'fps',
        status: fps > 55 ? 'good' : fps > 30 ? 'warning' : 'critical',
        threshold: { good: 55, warning: 30 },
      },
    ];
  }, [vitals, getSummary, fps]);

  // React Query cache statistics
  const cacheStats = useMemo(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      staleQueries: queries.filter(q => q.isStale()).length,
      errorQueries: queries.filter(q => q.state.error).length,
      loadingQueries: queries.filter(q => q.state.isFetching).length,
      cacheSize: JSON.stringify(queries.map(q => q.state.data)).length,
    };
  }, [queryClient]);

  const getStatusColor = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
    }
  };

  const getStatusIcon = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleExportMetrics = () => {
    const data = exportMetrics();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearCache = () => {
    queryClient.clear();
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        <Activity className="h-4 w-4 mr-2" />
        Performance
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <Activity className="h-6 w-6 mr-2" />
              Performance Monitor
            </h2>
            <div className="flex items-center space-x-2">
              <Badge variant={networkStatus === 'online' ? 'default' : 'destructive'}>
                <Wifi className="h-3 w-3 mr-1" />
                {networkStatus}
              </Badge>
              <Button onClick={handleExportMetrics} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => setIsVisible(false)} variant="outline" size="sm">
                Close
              </Button>
            </div>
          </div>

          <Tabs defaultValue="vitals" className="space-y-4">
            <TabsList>
              <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
              <TabsTrigger value="cache">Cache Performance</TabsTrigger>
              <TabsTrigger value="memory">Memory Usage</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
            </TabsList>

            <TabsContent value="vitals" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {performanceMetrics.map((metric) => (
                  <Card key={metric.name}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center justify-between">
                        {metric.name}
                        <Badge className={getStatusColor(metric.status)}>
                          {getStatusIcon(metric.status)}
                          {metric.status}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {metric.value.toFixed(metric.name === 'Cumulative Layout Shift' ? 3 : 0)}
                        <span className="text-sm font-normal text-gray-500 ml-1">
                          {metric.unit}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min((metric.value / metric.threshold.warning) * 100, 100)} 
                        className="mt-2"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Good: &lt;{metric.threshold.good}{metric.unit} | 
                        Warning: &lt;{metric.threshold.warning}{metric.unit}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="cache" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Database className="h-5 w-5 mr-2" />
                      Query Cache Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Queries:</span>
                      <Badge variant="outline">{cacheStats.totalQueries}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Stale Queries:</span>
                      <Badge variant={cacheStats.staleQueries > 0 ? 'destructive' : 'default'}>
                        {cacheStats.staleQueries}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Error Queries:</span>
                      <Badge variant={cacheStats.errorQueries > 0 ? 'destructive' : 'default'}>
                        {cacheStats.errorQueries}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Loading Queries:</span>
                      <Badge variant="outline">{cacheStats.loadingQueries}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Cache Size:</span>
                      <Badge variant="outline">
                        {(cacheStats.cacheSize / 1024).toFixed(1)} KB
                      </Badge>
                    </div>
                    <Button onClick={handleClearCache} variant="outline" size="sm" className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Clear Cache
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="h-5 w-5 mr-2" />
                      Performance Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Metrics:</span>
                      <Badge variant="outline">{getSummary().totalMetrics}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Duration:</span>
                      <Badge variant="outline">{getSummary().avgDuration.toFixed(0)}ms</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Duration:</span>
                      <Badge variant="outline">{getSummary().maxDuration.toFixed(0)}ms</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Min Duration:</span>
                      <Badge variant="outline">{getSummary().minDuration.toFixed(0)}ms</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="memory" className="space-y-4">
              {memoryUsage && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Database className="h-5 w-5 mr-2" />
                      Memory Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Used Memory</span>
                          <span>{(memoryUsage.used / 1024 / 1024).toFixed(1)} MB</span>
                        </div>
                        <Progress value={memoryUsage.percentage} />
                        <div className="text-xs text-gray-500 mt-1">
                          {memoryUsage.percentage}% of {(memoryUsage.total / 1024 / 1024).toFixed(1)} MB
                        </div>
                      </div>
                      
                      {memoryUsage.percentage > 80 && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                            <span className="text-sm text-yellow-800">
                              High memory usage detected. Consider refreshing the page.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="network" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wifi className="h-5 w-5 mr-2" />
                    Network Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Connection Status:</span>
                      <Badge variant={networkStatus === 'online' ? 'default' : 'destructive'}>
                        {networkStatus}
                      </Badge>
                    </div>
                    
                    {(navigator as any).connection && (
                      <>
                        <div className="flex justify-between">
                          <span>Connection Type:</span>
                          <Badge variant="outline">
                            {(navigator as any).connection.effectiveType || 'Unknown'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Downlink:</span>
                          <Badge variant="outline">
                            {(navigator as any).connection.downlink || 'Unknown'} Mbps
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
