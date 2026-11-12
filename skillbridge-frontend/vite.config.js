import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 5173,
    fs: {
      allow: [repositoryRoot],
    },
    proxy: {
      // Proxy API requests to backend (adjust if your backend uses a different port)
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
