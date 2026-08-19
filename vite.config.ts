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
            src: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%232b4c7e%22 stroke-width=%222%22><path d=%22M4 19.5A2.5 2.5 0 0 1 6.5 17H20%22/><path d=%22M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z%22/></svg>',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
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
