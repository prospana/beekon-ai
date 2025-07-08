import { logger } from './logger';

interface PerformanceMetrics {
  renderTime: number;
  bundleSize: number;
  memoryUsage: number;
  networkLatency: number;
  componentCount: number;
  rerenders: number;
  fps: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    renderTime: 0,
    bundleSize: 0,
    memoryUsage: 0,
    networkLatency: 0,
    componentCount: 0,
    rerenders: 0,
    fps: 0,
  };

  private observers: PerformanceObserver[] = [];
  private fpsCounter: number = 0;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;

  constructor() {
    if (window.__DEBUG__) {
      this.initializeMonitoring();
    }
  }

  private initializeMonitoring() {
    this.setupPerformanceObservers();
    this.startFPSMonitoring();
    this.monitorMemoryUsage();
    this.measureBundleSize();
  }

  private setupPerformanceObservers() {
    // Monitor paint timing
    if ('PerformanceObserver' in window) {
      try {
        const paintObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              logger.debug(`First Contentful Paint: ${entry.startTime.toFixed(2)}ms`, undefined, 'Performance');
            }
            if (entry.name === 'largest-contentful-paint') {
              logger.debug(`Largest Contentful Paint: ${entry.startTime.toFixed(2)}ms`, undefined, 'Performance');
            }
          });
        });
        paintObserver.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
        this.observers.push(paintObserver);
      } catch (e) {
        logger.warn('Paint observer not supported', e, 'Performance');
      }

      // Monitor navigation timing
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              logger.debug('Navigation timing', {
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
                loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
                totalTime: navEntry.loadEventEnd - navEntry.fetchStart,
              }, 'Performance');
            }
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);
      } catch (e) {
        logger.warn('Navigation observer not supported', e, 'Performance');
      }

      // Monitor long tasks
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.duration > 50) { // Tasks longer than 50ms
              logger.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`, {
                name: entry.name,
                startTime: entry.startTime,
                duration: entry.duration,
              }, 'Performance');
            }
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        logger.warn('Long task observer not supported', e, 'Performance');
      }
    }
  }

  private startFPSMonitoring() {
    let lastTime = performance.now();
    let frames = 0;

    const measureFPS = (currentTime: number) => {
      frames++;
      
      if (currentTime - lastTime >= 1000) {
        this.metrics.fps = frames;
        logger.debug(`FPS: ${frames}`, undefined, 'Performance');
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }

  private monitorMemoryUsage() {
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      this.metrics.memoryUsage = memoryInfo.usedJSHeapSize / (1024 * 1024); // MB
      
      setInterval(() => {
        const currentMemory = memoryInfo.usedJSHeapSize / (1024 * 1024);
        this.metrics.memoryUsage = currentMemory;
        
        if (currentMemory > 100) { // Warn if memory usage exceeds 100MB
          logger.warn(`High memory usage: ${currentMemory.toFixed(2)}MB`, {
            used: currentMemory,
            total: memoryInfo.totalJSHeapSize / (1024 * 1024),
            limit: memoryInfo.jsHeapSizeLimit / (1024 * 1024),
          }, 'Performance');
        }
      }, 5000);
    }
  }

  private measureBundleSize() {
    // Estimate bundle size from script tags
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;
    
    scripts.forEach(async (script) => {
      const src = (script as HTMLScriptElement).src;
      if (src.includes('localhost') || src.includes('assets')) {
        try {
          const response = await fetch(src, { method: 'HEAD' });
          const size = response.headers.get('content-length');
          if (size) {
            totalSize += parseInt(size);
          }
        } catch (e) {
          // Ignore fetch errors
        }
      }
    });

    this.metrics.bundleSize = totalSize / 1024; // KB
  }

  trackComponentRender(componentName: string, renderTime: number) {
    if (!window.__DEBUG__) return;
    
    this.metrics.renderTime = renderTime;
    this.metrics.rerenders++;
    
    if (renderTime > 16) { // Warn if render takes longer than 16ms (60fps)
      logger.warn(`Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`, {
        component: componentName,
        renderTime,
      }, 'Performance');
    }
  }

  trackNetworkLatency(url: string, latency: number) {
    if (!window.__DEBUG__) return;
    
    this.metrics.networkLatency = latency;
    
    if (latency > 1000) { // Warn if request takes longer than 1s
      logger.warn(`Slow network request: ${url} took ${latency.toFixed(2)}ms`, {
        url,
        latency,
      }, 'Performance');
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  generateReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.getMetrics(),
      timing: performance.timing,
      memory: (performance as any).memory,
      navigation: performance.navigation,
    };
    
    return JSON.stringify(report, null, 2);
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

// React Performance Hook
export const usePerformanceMonitor = (componentName: string) => {
  const startTime = performance.now();
  
  return {
    measure: () => {
      const renderTime = performance.now() - startTime;
      performanceMonitor.trackComponentRender(componentName, renderTime);
      return renderTime;
    },
  };
};

// HOC for component performance monitoring
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  return function PerformanceMonitoredComponent(props: P) {
    const monitor = usePerformanceMonitor(componentName || Component.name || 'Component');
    
    React.useEffect(() => {
      monitor.measure();
    });
    
    return <Component {...props} />;
  };
};