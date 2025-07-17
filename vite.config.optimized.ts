import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";

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
      react({
        devTarget: 'es2020', // Updated for better performance
        plugins: [
          // Add React compiler optimizations
          ["@babel/plugin-transform-react-jsx", { runtime: "automatic" }],
        ],
      }),
      isDevelopment && componentTagger(),
      // Bundle analyzer for production builds
      !isDevelopment && visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      sourcemap: isDevelopment ? 'inline' : false,
      minify: 'esbuild',
      chunkSizeWarningLimit: 300, // Reduced for better caching
      target: 'es2020', // Updated for better performance
      rollupOptions: {
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
        output: {
          // More granular chunking for better caching
          manualChunks: {
            // Core React and routing - keep together for initial load
            'react-core': ['react', 'react-dom'],
            'react-router': ['react-router-dom'],
            
            // Data fetching - separate chunk as it's used everywhere
            'data-fetching': ['@tanstack/react-query', '@supabase/supabase-js'],
            
            // UI framework - split into smaller chunks for better caching
            'radix-core': [
              '@radix-ui/react-slot',
              '@radix-ui/react-separator',
              '@radix-ui/react-label',
            ],
            'radix-overlays': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-popover',
              '@radix-ui/react-tooltip',
              '@radix-ui/react-alert-dialog',
            ],
            'radix-forms': [
              '@radix-ui/react-checkbox',
              '@radix-ui/react-radio-group',
              '@radix-ui/react-select',
              '@radix-ui/react-switch',
            ],
            'radix-navigation': [
              '@radix-ui/react-navigation-menu',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-tabs',
              '@radix-ui/react-accordion',
            ],
            'radix-feedback': [
              '@radix-ui/react-toast',
              '@radix-ui/react-progress',
            ],
            
            // Utility libraries - small and stable
            'utils': ['clsx', 'tailwind-merge', 'class-variance-authority'],
            
            // Form handling - used in specific pages
            'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
            
            // Icons - separate as they can be large
            'icons': ['lucide-react'],
            
            // Charts - feature-specific, load on demand
            'charts': ['recharts'],
            
            // Date utilities - used in multiple places
            'date-utils': ['date-fns'],
            
            // Markdown - only used in specific components
            'markdown': ['react-markdown', 'remark-gfm'],
            
            // Notifications - small but used globally
            'notifications': ['sonner'],
            
            // Theming - small and stable
            'theme': ['next-themes'],
            
            // Other UI components - group by usage frequency
            'ui-common': ['embla-carousel-react', 'react-resizable-panels'],
            'ui-specialized': ['vaul', 'input-otp'],
          },
          // Optimize chunk naming for better caching
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId;
            
            // Route-based chunks
            if (facadeModuleId) {
              if (facadeModuleId.includes('pages/Analysis')) {
                return 'routes/analysis-[hash].js';
              }
              if (facadeModuleId.includes('pages/Competitors')) {
                return 'routes/competitors-[hash].js';
              }
              if (facadeModuleId.includes('pages/Dashboard')) {
                return 'routes/dashboard-[hash].js';
              }
              if (facadeModuleId.includes('pages/Settings')) {
                return 'routes/settings-[hash].js';
              }
              if (facadeModuleId.includes('pages/Websites')) {
                return 'routes/websites-[hash].js';
              }
              
              // Component-based chunks
              if (facadeModuleId.includes('components/')) {
                const componentPath = facadeModuleId.split('components/')[1];
                const componentDir = componentPath?.split('/')[0];
                return `components/${componentDir}-[hash].js`;
              }
              
              // Service-based chunks
              if (facadeModuleId.includes('services/')) {
                return 'services/[name]-[hash].js';
              }
            }
            
            return 'chunks/[name]-[hash].js';
          },
          // Optimize asset naming
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || [];
            const ext = info[info.length - 1];
            
            if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name || '')) {
              return `images/[name]-[hash][extname]`;
            }
            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
              return `fonts/[name]-[hash][extname]`;
            }
            if (ext === 'css') {
              return `styles/[name]-[hash][extname]`;
            }
            
            return `assets/[name]-[hash][extname]`;
          },
        },
      },
    },
    define: {
      __DEV__: JSON.stringify(isDevelopment),
      __PROD__: JSON.stringify(mode === 'production'),
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@tanstack/react-query',
        '@supabase/supabase-js',
      ],
      exclude: isDevelopment ? ['@vite/client'] : [],
      // Pre-bundle heavy dependencies
      force: !isDevelopment,
    },
    css: {
      devSourcemap: isDevelopment,
      postcss: {
        plugins: [
          // Add CSS optimization plugins for production
          !isDevelopment && require('cssnano')({
            preset: ['default', {
              discardComments: { removeAll: true },
              normalizeWhitespace: true,
            }],
          }),
        ].filter(Boolean),
      },
    },
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
      legalComments: 'none',
      minifyIdentifiers: mode === 'production',
      minifySyntax: mode === 'production',
      minifyWhitespace: mode === 'production',
    },
    // Add performance optimizations
    experimental: {
      renderBuiltUrl(filename, { hostType }) {
        if (hostType === 'js') {
          // Use CDN for JS files in production
          return mode === 'production' 
            ? `https://cdn.yourdomain.com/${filename}`
            : filename;
        }
        return filename;
      },
    },
  };
});
