// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devServer: {
    host: 'localhost',
    port: 3000
  },
  compatibilityDate: '2025-05-11',
  ssr: true,
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: false,
    componentIslands: false
  },
  nitro: {
    moduleSideEffects: ['node-cron'],
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE || 'http://localhost:3000/api'
    }
  },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@sidebase/nuxt-auth'
  ],
  css: [
    '@/assets/css/tailwind.css'
  ],
  postcss: {
    plugins: {
      'tailwindcss/nesting': {},
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  routeRules: {
    '/**': { 
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Credentials': 'true'
      }
    },
    '/**/*.css': {
      headers: {
        'Content-Type': 'text/css'
      }
    },
    '/**/*.json': {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      title: 'Patient Coordinator',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      htmlAttrs: {
        lang: 'en'
      },
      script: [
        {
          id: 'early-theme-script',
          innerHTML: `
            (function() {
              try {
                var savedTheme = localStorage.getItem('theme');
                if (savedTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else if (savedTheme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (prefersDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                }
              } catch(e) {}
            })();
          `,
          type: 'text/javascript'
        }
      ]
    }
  }
})