/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage } from 'http';

const isPageNavigation = (req: IncomingMessage): boolean => {
  if (req.method !== 'GET') return false;
  const accept = req.headers?.accept || '';
  const secFetchDest = req.headers?.['sec-fetch-dest'];
  return accept.includes('text/html') || secFetchDest === 'document';
};

const createApiProxy = () => ({
  target: 'http://localhost:3000',
  changeOrigin: true,
  bypass: (req: IncomingMessage) => {
    // If the browser is performing a page navigation/refresh, serve index.html for SPA routing
    if (isPageNavigation(req)) {
      return '/index.html';
    }
  },
});

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': createApiProxy(),
      '/products': createApiProxy(),
      '/orders': createApiProxy(),
      '/health': createApiProxy(),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
  },
});
