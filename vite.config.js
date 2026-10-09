import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Cloudflare Pages sets CF_PAGES=1 during its build and serves from the site root,
// so it needs base "/". Everywhere else (GitHub Pages) keeps the /vanilliano/ subpath.
const onCloudflarePages = process.env.CF_PAGES === '1'

export default defineConfig(({ command }) => ({
  base: command === 'build' && !onCloudflarePages ? '/vanilliano/' : '/',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        admin: resolve(import.meta.dirname, 'admin/index.html'),
      },
    },
  },
  server: {
    allowedHosts: ['.trycloudflare.com', '.loca.lt'],
  },
}))