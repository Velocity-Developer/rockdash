import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

const MyPreset = definePreset(Aura, {
  semantic: {
      primary: {
          50: '{teal.50}',
          100: '{teal.100}',
          200: '{teal.200}',
          300: '{teal.300}',
          400: '{teal.400}',
          500: '{teal.500}',
          600: '{teal.600}',
          700: '{teal.700}',
          800: '{teal.800}',
          900: '{teal.900}',
          950: '{teal.950}'
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
    analyze: true
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
  tailwindcss: {   
    config: { 
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            primary: {
              DEFAULT: 'theme(colors.teal.500)',
              50: 'theme(colors.teal.50)',
              100: 'theme(colors.teal.100)',
              200: 'theme(colors.teal.200)',
              300: 'theme(colors.teal.300)',
              400: 'theme(colors.teal.400)',
              500: 'theme(colors.teal.500)',
              600: 'theme(colors.teal.600)',
              700: 'theme(colors.teal.700)',
              800: 'theme(colors.teal.800)',
              900: 'theme(colors.teal.900)',
            },
            secondary: {
              DEFAULT: 'theme(colors.blue.500)',
              50: 'theme(colors.blue.50)',
              100: 'theme(colors.blue.100)',
              200: 'theme(colors.blue.200)',
              300: 'theme(colors.blue.300)',
              400: 'theme(colors.blue.400)',
              500: 'theme(colors.blue.500)',
              600: 'theme(colors.blue.600)',
              700: 'theme(colors.blue.700)',
              800: 'theme(colors.blue.800)',
              900: 'theme(colors.blue.900)',
            },
          },
        },
      },
    },
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
    registerType: 'prompt',
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
      periodicSyncForUpdates: 20,
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
  }
})