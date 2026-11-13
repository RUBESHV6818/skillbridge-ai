import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = String(env.VITE_API_URL || '').trim();
  if (command === 'build' && !apiUrl) {
    throw new Error('Set VITE_API_URL to the deployed SkillBridge API before creating a production build.');
  }

  return {
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
        '/api': {
          target: apiUrl.replace(/\/api\/?$/i, '') || 'http://localhost:5001',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
