import { SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger';

export const wrapSupabaseClient = (client: SupabaseClient) => {
  if (!window.__DEBUG__) return client;

  // Create a proxy to intercept method calls
  return new Proxy(client, {
    get(target, prop) {
      const originalValue = target[prop as keyof SupabaseClient];
      
      if (prop === 'from' && typeof originalValue === 'function') {
        return function(table: string) {
          const result = originalValue.call(target, table);
          return wrapSupabaseQueryBuilder(result, table);
        };
      }
      
      if (prop === 'rpc' && typeof originalValue === 'function') {
        return function(fn: string, args?: any) {
          const startTime = performance.now();
          const queryId = `rpc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          logger.debug(`Supabase RPC: ${fn}`, {
            id: queryId,
            function: fn,
            arguments: args,
          }, 'Supabase');
          
          const result = originalValue.call(target, fn, args);
          
          if (result && typeof result.then === 'function') {
            return result.then(
              (data: any) => {
                const duration = performance.now() - startTime;
                logger.debug(`Supabase RPC completed: ${fn}`, {
                  id: queryId,
                  duration: `${duration.toFixed(2)}ms`,
                  success: true,
                }, 'Supabase');
                return data;
              },
              (error: any) => {
                const duration = performance.now() - startTime;
                logger.error(`Supabase RPC failed: ${fn}`, {
                  id: queryId,
                  error: error.message || error,
                  duration: `${duration.toFixed(2)}ms`,
                }, 'Supabase');
                throw error;
              }
            );
          }
          
          return result;
        };
      }
      
      return originalValue;
    }
  });
};

const wrapSupabaseQueryBuilder = (queryBuilder: any, tableName: string) => {
  if (!window.__DEBUG__) return queryBuilder;

  const operations = ['select', 'insert', 'update', 'delete', 'upsert'];
  
  return new Proxy(queryBuilder, {
    get(target, prop) {
      const originalValue = target[prop as string];
      
      if (operations.includes(prop as string) && typeof originalValue === 'function') {
        return function(...args: any[]) {
          const startTime = performance.now();
          const queryId = `${prop}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          logger.debug(`Supabase ${prop}: ${tableName}`, {
            id: queryId,
            table: tableName,
            operation: prop as string,
            args: args.length > 0 ? args : undefined,
          }, 'Supabase');
          
          const result = originalValue.apply(target, args);
          
          // Continue wrapping the chain
          return wrapSupabaseQueryBuilder(result, tableName);
        };
      }
      
      // Wrap the final execution methods
      if (['then', 'catch', 'finally'].includes(prop as string) && typeof originalValue === 'function') {
        return function(...args: any[]) {
          if (prop === 'then') {
            const originalThen = args[0];
            const wrappedThen = (data: any) => {
              const duration = performance.now() - (target._startTime || performance.now());
              logger.debug(`Supabase query completed`, {
                table: tableName,
                duration: `${duration.toFixed(2)}ms`,
                success: !data.error,
                error: data.error?.message,
              }, 'Supabase');
              return originalThen ? originalThen(data) : data;
            };
            args[0] = wrappedThen;
          }
          
          if (prop === 'catch') {
            const originalCatch = args[0];
            const wrappedCatch = (error: any) => {
              const duration = performance.now() - (target._startTime || performance.now());
              logger.error(`Supabase query failed`, {
                table: tableName,
                error: error.message || error,
                duration: `${duration.toFixed(2)}ms`,
              }, 'Supabase');
              return originalCatch ? originalCatch(error) : Promise.reject(error);
            };
            args[0] = wrappedCatch;
          }
          
          return originalValue.apply(target, args);
        };
      }
      
      return originalValue;
    }
  });
};

export const initSupabaseDebugging = () => {
  if (!window.__DEBUG__) return;
  
  logger.info('Supabase debugging initialized', undefined, 'Debug');
};