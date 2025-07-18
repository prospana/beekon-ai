// Simplified exports to avoid build issues
// Components are imported directly without lazy loading for now

export function withLazyLoading<T extends React.ComponentType<any>>(Component: T) {
  return Component;
}

// Simple hook placeholders
export function useLazyComponent<T extends React.ComponentType<any>>(
  _componentLoader: () => Promise<{ default: T }>,
  _shouldLoad: boolean = true
) {
  return { Component: null as T | null, isLoading: false, error: null };
}

export function useIntersectionLazyLoading<T extends React.ComponentType<any>>(
  _componentLoader: () => Promise<{ default: T }>,
  _options: IntersectionObserverInit = {}
) {
  return { 
    Component: null as T | null, 
    isLoading: false, 
    error: null, 
    ref: () => {} 
  };
}