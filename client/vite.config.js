// Vite dev server and build. /api is proxied to Express so the browser sees one origin and the
// session cookie just works. The .env file lives at the repository root, shared with the server.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  envDir: '..',
  build: {
    // The main chunk is React 19, the router and TanStack Query (about 150 kB gzipped); the chart
    // library is split into the lazily loaded Reports and doctor pages.
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:4000' },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.js'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
});
