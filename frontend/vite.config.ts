import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = env.API_PROXY_TARGET?.trim();
  const artworkAssetBaseUrl =
    env.VITE_ARTWORK_ASSET_BASE_URL?.trim() ||
    'https://d2oephvbntzgfl.cloudfront.net';

  return {
    root: './',
    plugins: [react()],
    define: {
      'import.meta.env.VITE_ARTWORK_ASSET_BASE_URL': JSON.stringify(
        artworkAssetBaseUrl,
      ),
    },
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
    publicDir: path.resolve(__dirname, 'public'),
  };
});
