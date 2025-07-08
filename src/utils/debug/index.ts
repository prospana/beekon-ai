export { logger } from './logger';
export type { LogLevel, LogEntry } from './logger';
export { DebugProvider, useDebug } from './DebugContext';
export type { DebugState, DebugContextType } from './DebugContext';
export { 
  useDebugRender, 
  useDebugMount, 
  useDebugPerformance, 
  useDebugNetworkRequest, 
  useDebugSupabase 
} from './useDebug';
export { apiDebugger, initApiDebugging } from './api-debug';
export { wrapSupabaseClient, initSupabaseDebugging } from './supabase-debug';
export { enhanceConsole, setupDebugKeyboardShortcuts, initConsoleDebugging } from './console-debug';
export { performanceMonitor, usePerformanceMonitor, withPerformanceMonitoring } from './performance-monitor';

declare global {
  interface Window {
    __DEBUG__: boolean;
    __DEV__: boolean;
    __PROD__: boolean;
  }
}