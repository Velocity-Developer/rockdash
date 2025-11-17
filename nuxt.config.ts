import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

const MyPreset = definePreset(Aura, {
  semantic: {
      primary: {
        50: 'var(--p-primary-50)',
        100: 'var(--p-primary-100)',
        200: 'var(--p-primary-200)',
        300: 'var(--p-primary-300)',
        400: 'var(--p-primary-400)',
        500: 'var(--p-primary-500)',
        600: 'var(--p-primary-600)',
        700: 'var(--p-primary-700)',
        800: 'var(--p-primary-800)',
        900: 'var(--p-primary-900)',
      },
      secondary: {
        50: 'var(--p-secondary-50)',
        100: 'var(--p-secondary-100)',
        200: 'var(--p-secondary-200)',
        300: 'var(--p-secondary-300)',
        400: 'var(--p-secondary-400)',
        500: 'var(--p-secondary-500)',
        600: 'var(--p-secondary-600)',
        700: 'var(--p-secondary-700)',
        800: 'var(--p-secondary-800)',
        900: 'var(--p-secondary-900)',
      }
  }
});

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: {
    enabled: false,

    timeline: {
      enabled: false
    }
  },
  build: {
    analyze: false
  },
  ssr: false,  
  sanctum: {
    mode: 'cookie',
    baseUrl: process.env.API_URL,
    redirectIfAuthenticated: true,
    redirectIfUnauthenticated: true,
    redirect: {
      keepRequestedRoute: true,
      onAuthOnly: '/login',
      onGuestOnly: '/',
      onLogout: '/login'
    },
    globalMiddleware: {
      enabled: true,
      allow404WithoutAuth: true,
    },
    logLevel: 1,
  },
  primevue: {
    autoImport: true,
    options: {
        theme: {
            preset: MyPreset,
            options: {
              darkModeSelector: '.dark',
            }
        }
    }
  },
  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-auth-sanctum',
    '@primevue/nuxt-module',
    '@nuxt/icon',
    '@pinia/nuxt',
    'dayjs-nuxt',
    '@nuxt/fonts',
    '@vite-pwa/nuxt'
  ],
  pwa: {
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'pwa-192x192.png', 'pwa-512x512.png', 'pwa-180x180.png'],
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,webp}'],
      navigateFallbackDenylist: [/^\/_/, /^\/api/, /\.(?:png|jpg|jpeg|svg|webp|ico)$/],
      runtimeCaching: [
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|webp|ico)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            },
          },
        },
      ],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 1440, // 24 hours instead of 20 minutes
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/(?!.*\.(png|jpg|jpeg|svg|webp|ico|css|js)$).*$/],
      type: 'module',
    },
    manifest: {
      name: 'New Nglorok',
      short_name: 'New Nglorok',
      description: 'Aplikasi untuk manajemen project dan data Velocity Developer',
      theme_color: '#034235',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/splash',
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: '/pwa-180x180.png',
          sizes: '180x180',
          type: 'image/png',
          purpose: 'any',
        },
      ],
    },
  },
  appConfig: {
    //for testing purposes
    buildDate: new Date().toISOString(),
    version: '1.0.1',
    buildNumber: process.env.BUILD_NUMBER || Math.floor(Date.now() / 1000).toString(),
    environment: process.env.NODE_ENV || 'development',
    buildHash: process.env.COMMIT_HASH || Math.random().toString(36).substring(2, 8),
  },
  app: {
    head: {
      link: [
        { rel: 'manifest', href: '/manifest.webmanifest' }
      ]
    }
  },
  vite: {
    optimizeDeps: {
      exclude: ['primevue', '@primeuix/themes']
    },
    ssr: {
      noExternal: ['primevue', '@primeuix/themes']
    },
    server: {
      watch: {
        usePolling: true,
        interval: 100
      }
    }
  }
})