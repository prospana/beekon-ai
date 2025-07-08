import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDebug = mode === 'debug';
  const isDevelopment = mode === 'development' || isDebug;
  
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
        // Enable React Developer Tools in debug mode
        devTarget: isDebug ? 'esnext' : 'es2015',
        jsxImportSource: '@emotion/react',
      }),
      isDevelopment && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      sourcemap: isDevelopment ? 'inline' : false,
      minify: isDebug ? false : 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: isDevelopment ? undefined : {
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-accordion', '@radix-ui/react-alert-dialog'],
            utils: ['clsx', 'tailwind-merge'],
          },
        },
      },
    },
    define: {
      __DEBUG__: JSON.stringify(isDebug),
      __DEV__: JSON.stringify(isDevelopment),
      __PROD__: JSON.stringify(mode === 'production'),
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
