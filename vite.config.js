import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [react()],
  // ADD THIS LINE: It MUST match your repo name exactly
  base: "/L.I.V.E./", 
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
})
