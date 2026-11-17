import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Las claves NO llevan prefijo VITE_, así que nunca llegan al código del navegador:
  // solo las lee este servidor y las añade a las peticiones del proxy.
  const env = loadEnv(mode, process.cwd(), '')

  const proxy = {
    '/api/espn': {
      target: 'https://site.api.espn.com',
      changeOrigin: true,
      rewrite: (p: string) => p.replace(/^\/api\/espn/, '/apis/site/v2/sports/soccer'),
    },
    '/api/espn-v2': {
      target: 'https://site.api.espn.com',
      changeOrigin: true,
      rewrite: (p: string) => p.replace(/^\/api\/espn-v2/, '/apis/v2/sports/soccer'),
    },
    '/api/futbolenlatv': {
      target: 'https://www.futbolenlatv.es',
      changeOrigin: true,
      rewrite: (p: string) => p.replace(/^\/api\/futbolenlatv/, ''),
    },
    '/api/futbolme': {
      target: 'https://futbolme.com',
      changeOrigin: true,
      rewrite: (p: string) => p.replace(/^\/api\/futbolme/, ''),
    },
    '/api/apifootball': {
      target: 'https://v3.football.api-sports.io',
      changeOrigin: true,
      rewrite: (p: string) => p.replace(/^\/api\/apifootball/, ''),
      headers: env.API_FOOTBALL_KEY ? { 'x-apisports-key': env.API_FOOTBALL_KEY } : {},
    },
    '/api/footballdata': {
      target: 'https://api.football-data.org',
      changeOrigin: true,
      rewrite: (p: string) => p.replace(/^\/api\/footballdata/, '/v4'),
      headers: env.FOOTBALL_DATA_KEY ? { 'X-Auth-Token': env.FOOTBALL_DATA_KEY } : {},
    },
  }

  return {
    plugins: [react(), tailwindcss()],
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      __APP_BUILD_SHA__: JSON.stringify(env.VITE_BUILD_SHA || ''),
      __APP_BUILD_TIME__: JSON.stringify(env.VITE_BUILD_TIME || new Date().toISOString()),
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src'),
      },
    },
    server: { proxy },
    preview: { proxy },
    test: {
      include: ['tests/**/*.test.ts'],
    },
  }
})
