import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        ...(mode === 'production' ? [VitePWA({
          registerType: 'autoUpdate',
          injectRegister: 'auto',
          includeAssets: ['pwa-192x192.png', 'pwa-512x512.png'],
          manifest: {
            name: 'Famille Chrétienne Foi Parfaite',
            short_name: 'FCFP',
            description: 'Application de gestion pour la Famille Chrétienne Foi Parfaite',
            theme_color: '#0a0a0a',
            background_color: '#0a0a0a',
            display: 'standalone',
            icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png'
              },
              {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          }
        })] : [])
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
