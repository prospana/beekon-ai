import { useEffect, useRef } from 'react';
import { useDebug as useDebugContext } from './DebugContext';
import { logger } from './logger';

export const useDebug = useDebugContext;

export const useDebugRender = (componentName: string) => {
  const { actions } = useDebugContext();
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current++;
    actions.trackRender(componentName);
    logger.debug(`${componentName} rendered`, { renderCount: renderCountRef.current }, 'Render');
  });

  return renderCountRef.current;
};

export const useDebugMount = (componentName: string) => {
  const { actions } = useDebugContext();

  useEffect(() => {
    logger.debug(`${componentName} mounted`, undefined, 'Mount');
    return () => {
      logger.debug(`${componentName} unmounted`, undefined, 'Unmount');
    };
  }, [componentName, actions]);
};

export const useDebugPerformance = (operationName: string) => {
  const { actions } = useDebugContext();

  return {
    start: () => {
      const startTime = performance.now();
      logger.debug(`${operationName} started`, { startTime }, 'Performance');
      
      return {
        end: () => {
          const endTime = performance.now();
          const duration = endTime - startTime;
          actions.trackApiCall(operationName, duration);
          logger.debug(`${operationName} completed`, { duration: `${duration.toFixed(2)}ms` }, 'Performance');
          return duration;
        },
      };
    },
  };
};

export const useDebugNetworkRequest = () => {
  const { actions } = useDebugContext();

  return {
    track: (id: string, method: string, url: string, status?: number, duration?: number) => {
      actions.trackNetworkRequest(id, method, url, status, duration);
      logger.debug(`Network request: ${method} ${url}`, { id, status, duration }, 'Network');
    },
  };
};

export const useDebugSupabase = () => {
  const { actions } = useDebugContext();

  return {
    trackQuery: (id: string, table: string, operation: string, duration?: number, error?: string) => {
      actions.trackSupabaseQuery(id, table, operation, duration, error);
      logger.debug(`Supabase query: ${operation} on ${table}`, { id, duration, error }, 'Supabase');
    },
  };
};