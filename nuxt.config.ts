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
  appConfig: {
    //for testing purposes
    buildDate: new Date().toISOString(),
  },
  pwa: {
    registerType: 'autoUpdate',
    // Add client manifest for better offline support
    includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
    manifest: {
      name: 'VDNET',
      short_name: 'VDNET',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#ffffff',
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
        }
      ]
    },
    workbox: {
      navigateFallback: '/index.html',
      globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,svg,ico,woff2}'],
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.destination === 'document',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'html-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 hari
            },
          },
        },
        {
          urlPattern: /\.(?:js|css|woff2|ico|png|jpg|jpeg|svg)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'static-assets',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 hari
            },
          },
        },
      ],
    },
  }
})