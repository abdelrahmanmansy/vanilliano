import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/vanilliano/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ['.trycloudflare.com', '.loca.lt'],
  },
}))