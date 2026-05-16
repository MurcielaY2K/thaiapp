import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

export default defineConfig({
  base: '/thaiapp/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ThaiQuest',
        short_name: 'ThaiQuest',
        description: 'Learn Thai through adventure',
        theme_color: '#8B5CF6',
        background_color: '#0A0A1B',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/thaiapp/',
        scope: '/thaiapp/',
        icons: [
          { src: '/thaiapp/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/thaiapp/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@engine': resolve(__dirname, '../src'),
    },
  },
  optimizeDeps: {
    exclude: ['@engine'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          engine: ['@engine/GameFacade', '@engine/data/vocabulary', '@engine/data/quests'],
        },
      },
    },
  },
});
