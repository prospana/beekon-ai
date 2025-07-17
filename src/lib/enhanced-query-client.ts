import { QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

// Enhanced cache configuration with better performance
export const createEnhancedQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 60 * 1000, // 10 minutes - increased from 5
        cacheTime: 30 * 60 * 1000, // 30 minutes - increased from 10
        retry: (failureCount, error) => {
          if (error && typeof error === 'object' && 'status' in error) {
            const status = error.status as number;
            if (status >= 400 && status < 500) return false;
          }
          return failureCount < 2; // Reduced retries from 3 to 2
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
        // Add background refetch for critical data
        refetchInterval: (data, query) => {
          // Only refresh dashboard metrics every 5 minutes in background
          if (query.queryKey[0] === 'dashboard' && query.queryKey[1] === 'metrics') {
            return 5 * 60 * 1000;
          }
          return false;
        },
        // Enable request deduplication
        networkMode: 'online',
      },
      mutations: {
        retry: 1,
        networkMode: 'online',
      },
    },
  });

  // Add persistent storage for better performance
  const persister = createSyncStoragePersister({
    storage: window.localStorage,
    key: 'beekon-cache-v2',
    throttleTime: 1000,
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  });

  persistQueryClient({
    queryClient,
    persister,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    buster: process.env.NODE_ENV === 'development' ? Date.now().toString() : '2.0.0',
  });

  return queryClient;
};

// Request deduplication utility
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();

  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  clear() {
    this.pendingRequests.clear();
  }
}

export const requestDeduplicator = new RequestDeduplicator();

// Cache invalidation utilities
export const cacheInvalidation = {
  // Invalidate all dashboard data
  invalidateDashboard: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  },
  
  // Invalidate specific website data
  invalidateWebsite: (queryClient: QueryClient, websiteId: string) => {
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const key = query.queryKey;
        return Array.isArray(key) && key.some(k => 
          Array.isArray(k) && k.includes(websiteId)
        );
      }
    });
  },
  
  // Smart invalidation based on data relationships
  invalidateRelated: (queryClient: QueryClient, type: 'analysis' | 'website' | 'topic' | 'competitor', id: string) => {
    const patterns = {
      analysis: [['dashboard'], ['analysis'], ['competitors']],
      website: [['dashboard'], ['websites'], ['analysis']],
      topic: [['dashboard'], ['analysis'], ['topics']],
      competitor: [['competitors'], ['dashboard']],
    };
    
    patterns[type].forEach(pattern => {
      queryClient.invalidateQueries({ queryKey: pattern });
    });
  },
};

// Optimistic update utilities
export const optimisticUpdates = {
  addCompetitor: (queryClient: QueryClient, websiteId: string, competitor: any) => {
    queryClient.setQueryData(['competitors', 'list', websiteId], (old: any[]) => {
      return old ? [...old, competitor] : [competitor];
    });
  },
  
  removeCompetitor: (queryClient: QueryClient, websiteId: string, competitorId: string) => {
    queryClient.setQueryData(['competitors', 'list', websiteId], (old: any[]) => {
      return old ? old.filter(c => c.id !== competitorId) : [];
    });
  },
};
