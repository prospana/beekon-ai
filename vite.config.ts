import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';
  
  return {
    server: {
      host: "::",
      port: 8080,
      open: false,
      cors: true,
      hmr: {
        overlay: true,
      },
    },
    plugins: [
      react(),
      isDevelopment && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      __DEV__: JSON.stringify(isDevelopment),
      __PROD__: JSON.stringify(mode === 'production'),
      // Add crypto polyfill
      global: 'globalThis',
    },
    build: {
      sourcemap: isDevelopment ? 'inline' : false,
      minify: 'esbuild',
      chunkSizeWarningLimit: 500, // Smaller chunks for better caching
      target: 'es2015',
      rollupOptions: {
        treeshake: {
          moduleSideEffects: false,
        },
        output: {
          manualChunks: {
            // Core React and routing
            vendor: ['react', 'react-dom', 'react-router-dom'],
            
            // Data fetching and state management
            query: ['@tanstack/react-query'],
            supabase: ['@supabase/supabase-js'],
            
            // UI components - split into smaller chunks
            radix: [
              '@radix-ui/react-accordion', 
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-avatar',
              '@radix-ui/react-checkbox',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-label',
              '@radix-ui/react-navigation-menu',
              '@radix-ui/react-popover',
              '@radix-ui/react-progress',
              '@radix-ui/react-radio-group',
              '@radix-ui/react-scroll-area',
              '@radix-ui/react-select',
              '@radix-ui/react-separator',
              '@radix-ui/react-slot',
              '@radix-ui/react-switch',
              '@radix-ui/react-tabs',
              '@radix-ui/react-toast',
              '@radix-ui/react-toggle',
              '@radix-ui/react-tooltip'
            ],
            
            // Utility libraries
            utils: ['clsx', 'tailwind-merge', 'class-variance-authority'],
            
            // Form handling
            forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
            
            // Icons - separate chunk as they can be large
            icons: ['lucide-react'],
            
            // Charts - separate chunk as they are feature-specific
            charts: ['recharts'],
            
            // Date and time utilities
            date: ['date-fns'],
            
            // Markdown rendering
            markdown: ['react-markdown', 'remark-gfm'],
            
            // Notifications
            toast: ['sonner'],
            
            // Theming
            theme: ['next-themes'],
            
            // Other UI components
            ui: ['embla-carousel-react', 'vaul', 'input-otp', 'react-resizable-panels'],
          },
          // Split route chunks by functionality
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId;
            if (facadeModuleId) {
              if (facadeModuleId.includes('pages/Analysis')) {
                return 'chunks/analysis-[hash].js';
              }
              if (facadeModuleId.includes('pages/Competitors')) {
                return 'chunks/competitors-[hash].js';
              }
              if (facadeModuleId.includes('pages/Dashboard')) {
                return 'chunks/dashboard-[hash].js';
              }
              if (facadeModuleId.includes('pages/Settings')) {
                return 'chunks/settings-[hash].js';
              }
              if (facadeModuleId.includes('pages/Websites')) {
                return 'chunks/websites-[hash].js';
              }
            }
            return 'chunks/[name]-[hash].js';
          },
        },
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: isDevelopment ? ['@vite/client'] : [],
    },
    css: {
      devSourcemap: isDevelopment,
    },
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
  };
});
