import { logger } from './logger';

export interface ApiDebugConfig {
  logRequests: boolean;
  logResponses: boolean;
  logErrors: boolean;
  logTiming: boolean;
}

const defaultConfig: ApiDebugConfig = {
  logRequests: true,
  logResponses: true,
  logErrors: true,
  logTiming: true,
};

class ApiDebugger {
  private config: ApiDebugConfig = defaultConfig;
  private requestCounter = 0;

  setConfig(config: Partial<ApiDebugConfig>) {
    this.config = { ...this.config, ...config };
  }

  trackRequest(method: string, url: string, data?: any) {
    if (!this.config.logRequests || !window.__DEBUG__) return;

    const requestId = `req-${++this.requestCounter}`;
    logger.debug(`API Request: ${method} ${url}`, {
      id: requestId,
      method,
      url,
      data,
    }, 'API');

    return requestId;
  }

  trackResponse(requestId: string, status: number, data?: any, duration?: number) {
    if (!this.config.logResponses || !window.__DEBUG__) return;

    logger.debug(`API Response: ${status}`, {
      id: requestId,
      status,
      data,
      duration: duration ? `${duration}ms` : undefined,
    }, 'API');
  }

  trackError(requestId: string, error: any, duration?: number) {
    if (!this.config.logErrors || !window.__DEBUG__) return;

    logger.error(`API Error`, {
      id: requestId,
      error: error.message || error,
      stack: error.stack,
      duration: duration ? `${duration}ms` : undefined,
    }, 'API');
  }

  wrapFetch(originalFetch: typeof fetch) {
    return async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.url;
      const method = init?.method || 'GET';
      const startTime = performance.now();
      
      const requestId = this.trackRequest(method, url, init?.body);
      
      try {
        const response = await originalFetch(input, init);
        const duration = performance.now() - startTime;
        
        if (this.config.logTiming) {
          this.trackResponse(requestId, response.status, undefined, duration);
        }
        
        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        this.trackError(requestId, error, duration);
        throw error;
      }
    };
  }
}

export const apiDebugger = new ApiDebugger();

export const initApiDebugging = () => {
  if (!window.__DEBUG__) return;

  // Wrap the global fetch function
  const originalFetch = window.fetch;
  window.fetch = apiDebugger.wrapFetch(originalFetch);
  
  logger.info('API debugging initialized', undefined, 'Debug');
};