// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

import mdx from '@astrojs/mdx';

import AstroPWA from '@vite-pwa/astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://your-domain.com',
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    mdx(),
    AstroPWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Tech AI Blog',
        short_name: 'TechAI',
        description: 'A modern technical blog focused on AI and technology topics',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/offline',
        globPatterns: ['**/*.{css,js,html,svg,png,ico,txt,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/your-domain\.com\/blog\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'blog-posts',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
          {
            urlPattern: /^https:\/\/your-domain\.com\/(images|icons)\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/your-domain\.com\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        navigateFallbackAllowlist: [/^\/404$/, /^\/offline$/],
        suppressWarnings: true,
      },
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
    }),
  ],
  vite: {
    ssr: {
      noExternal: ['@astrojs/*'],
    },
  },
});
