import { logger } from './logger';

export const enhanceConsole = () => {
  if (!window.__DEBUG__) return;

  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
    group: console.group,
    groupEnd: console.groupEnd,
    time: console.time,
    timeEnd: console.timeEnd,
  };

  // Enhanced console.log with context
  console.log = (...args: any[]) => {
    originalConsole.log(...args);
    logger.debug(args.join(' '), { args }, 'Console');
  };

  console.info = (...args: any[]) => {
    originalConsole.info(...args);
    logger.info(args.join(' '), { args }, 'Console');
  };

  console.warn = (...args: any[]) => {
    originalConsole.warn(...args);
    logger.warn(args.join(' '), { args }, 'Console');
  };

  console.error = (...args: any[]) => {
    originalConsole.error(...args);
    logger.error(args.join(' '), { args }, 'Console');
  };

  console.debug = (...args: any[]) => {
    originalConsole.debug(...args);
    logger.debug(args.join(' '), { args }, 'Console');
  };

  // Add custom debug methods
  (console as any).logWithContext = (message: string, data?: any, context?: string) => {
    const timestamp = new Date().toISOString();
    const prefix = context ? `[${context}]` : '';
    originalConsole.log(`${timestamp} ${prefix} ${message}`, data);
    logger.debug(message, data, context);
  };

  (console as any).logComponent = (componentName: string, props?: any, state?: any) => {
    const timestamp = new Date().toISOString();
    originalConsole.group(`${timestamp} [${componentName}] Component State`);
    if (props) {
      originalConsole.log('Props:', props);
    }
    if (state) {
      originalConsole.log('State:', state);
    }
    originalConsole.groupEnd();
    
    logger.debug(`Component: ${componentName}`, { props, state }, 'Component');
  };

  (console as any).logPerformance = (operation: string, duration: number) => {
    const timestamp = new Date().toISOString();
    originalConsole.log(`${timestamp} [Performance] ${operation}: ${duration.toFixed(2)}ms`);
    logger.debug(`Performance: ${operation}`, { duration: `${duration.toFixed(2)}ms` }, 'Performance');
  };

  (console as any).logNetwork = (method: string, url: string, status?: number, duration?: number) => {
    const timestamp = new Date().toISOString();
    const statusText = status ? ` (${status})` : '';
    const durationText = duration ? ` - ${duration.toFixed(2)}ms` : '';
    originalConsole.log(`${timestamp} [Network] ${method} ${url}${statusText}${durationText}`);
    logger.debug(`Network: ${method} ${url}`, { status, duration }, 'Network');
  };

  // Performance timing helpers
  const timers = new Map<string, number>();
  
  console.time = (label: string) => {
    timers.set(label, performance.now());
    originalConsole.time(label);
  };

  console.timeEnd = (label: string) => {
    const startTime = timers.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      timers.delete(label);
      (console as any).logPerformance(label, duration);
    }
    originalConsole.timeEnd(label);
  };

  // Restore original console methods
  return () => {
    Object.assign(console, originalConsole);
  };
};

// Debug keyboard shortcuts
export const setupDebugKeyboardShortcuts = (toggleDebugPanel: () => void) => {
  if (!window.__DEBUG__) return;

  const handleKeyDown = (event: KeyboardEvent) => {
    // Ctrl+Shift+D to toggle debug panel
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
      event.preventDefault();
      toggleDebugPanel();
    }
    
    // Ctrl+Shift+L to clear logs
    if (event.ctrlKey && event.shiftKey && event.key === 'L') {
      event.preventDefault();
      logger.clearLogs();
      console.clear();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
};

export const initConsoleDebugging = () => {
  if (!window.__DEBUG__) return;
  
  enhanceConsole();
  logger.info('Console debugging initialized', undefined, 'Debug');
  logger.info('Keyboard shortcuts: Ctrl+Shift+D (toggle panel), Ctrl+Shift+L (clear logs)', undefined, 'Debug');
};