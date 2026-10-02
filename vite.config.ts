import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'bible-datasets/*.csv'],
      manifest: {
        name: 'Bible - Personal Reading & Study',
        short_name: 'Bible',
        description: 'A clean, modern, personal Bible web application in English and Tamil.',
        theme_color: '#fbfbf9',
        background_color: '#fbfbf9',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,csv}']
      }
    })
  ],
  server: {
    port: 3000,
    host: true
  }
});
