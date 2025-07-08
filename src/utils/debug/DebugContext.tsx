import { createContext, useContext, useEffect, useState } from 'react';
import { logger, LogEntry } from './logger';

export interface DebugState {
  isDebugMode: boolean;
  showDebugPanel: boolean;
  logs: LogEntry[];
  performance: {
    renderCount: number;
    lastRenderTime: number;
    componentMounts: Record<string, number>;
    apiCalls: Record<string, { count: number; averageTime: number }>;
  };
  network: {
    requests: Array<{
      id: string;
      method: string;
      url: string;
      status?: number;
      duration?: number;
      timestamp: Date;
    }>;
  };
  supabase: {
    queries: Array<{
      id: string;
      table: string;
      operation: string;
      duration?: number;
      error?: string;
      timestamp: Date;
    }>;
  };
}

export interface DebugContextType {
  state: DebugState;
  actions: {
    toggleDebugPanel: () => void;
    clearLogs: () => void;
    trackRender: (componentName: string) => void;
    trackApiCall: (name: string, duration: number) => void;
    trackNetworkRequest: (id: string, method: string, url: string, status?: number, duration?: number) => void;
    trackSupabaseQuery: (id: string, table: string, operation: string, duration?: number, error?: string) => void;
  };
}

const DebugContext = createContext<DebugContextType | null>(null);

export const useDebug = () => {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
};

export const DebugProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DebugState>({
    isDebugMode: Boolean(window.__DEBUG__),
    showDebugPanel: false,
    logs: [],
    performance: {
      renderCount: 0,
      lastRenderTime: 0,
      componentMounts: {},
      apiCalls: {},
    },
    network: {
      requests: [],
    },
    supabase: {
      queries: [],
    },
  });

  useEffect(() => {
    if (state.isDebugMode) {
      const interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          logs: logger.getLogs(),
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [state.isDebugMode]);

  const actions = {
    toggleDebugPanel: () => {
      setState(prev => ({ ...prev, showDebugPanel: !prev.showDebugPanel }));
    },

    clearLogs: () => {
      logger.clearLogs();
      setState(prev => ({ ...prev, logs: [] }));
    },

    trackRender: (componentName: string) => {
      if (!state.isDebugMode) return;
      
      setState(prev => ({
        ...prev,
        performance: {
          ...prev.performance,
          renderCount: prev.performance.renderCount + 1,
          lastRenderTime: Date.now(),
          componentMounts: {
            ...prev.performance.componentMounts,
            [componentName]: (prev.performance.componentMounts[componentName] || 0) + 1,
          },
        },
      }));
    },

    trackApiCall: (name: string, duration: number) => {
      if (!state.isDebugMode) return;
      
      setState(prev => {
        const existing = prev.performance.apiCalls[name];
        const newAverage = existing 
          ? (existing.averageTime * existing.count + duration) / (existing.count + 1)
          : duration;
        
        return {
          ...prev,
          performance: {
            ...prev.performance,
            apiCalls: {
              ...prev.performance.apiCalls,
              [name]: {
                count: existing ? existing.count + 1 : 1,
                averageTime: newAverage,
              },
            },
          },
        };
      });
    },

    trackNetworkRequest: (id: string, method: string, url: string, status?: number, duration?: number) => {
      if (!state.isDebugMode) return;
      
      setState(prev => ({
        ...prev,
        network: {
          ...prev.network,
          requests: [
            ...prev.network.requests,
            {
              id,
              method,
              url,
              status,
              duration,
              timestamp: new Date(),
            },
          ].slice(-100), // Keep only last 100 requests
        },
      }));
    },

    trackSupabaseQuery: (id: string, table: string, operation: string, duration?: number, error?: string) => {
      if (!state.isDebugMode) return;
      
      setState(prev => ({
        ...prev,
        supabase: {
          ...prev.supabase,
          queries: [
            ...prev.supabase.queries,
            {
              id,
              table,
              operation,
              duration,
              error,
              timestamp: new Date(),
            },
          ].slice(-100), // Keep only last 100 queries
        },
      }));
    },
  };

  return (
    <DebugContext.Provider value={{ state, actions }}>
      {children}
    </DebugContext.Provider>
  );
};