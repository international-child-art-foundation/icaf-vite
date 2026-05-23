import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = env.API_PROXY_TARGET?.trim();

  return {
    root: './',
    plugins: [react()],
    ...(apiProxyTarget
      ? {
          server: {
            proxy: {
              '/api': {
                target: apiProxyTarget,
                changeOrigin: true,
                secure: false,
              },
            },
          },
        }
      : {}),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    publicDir: env.VITE_PUBLIC_DIR || path.resolve(__dirname, 'public'),
  };
});
