import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { imagetools } from 'vite-imagetools';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    root: './',
    plugins: [react(), imagetools()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@icaf/shared': path.resolve(__dirname, '../shared/src'),
      },
    },
    publicDir: env.VITE_PUBLIC_DIR || path.resolve(__dirname, 'public'),
  };
});
