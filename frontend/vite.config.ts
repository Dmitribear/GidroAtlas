import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': resolve(rootDir, 'src/app'),
      '@shared': resolve(rootDir, 'src/shared'),
      '@entities': resolve(rootDir, 'src/entities'),
      '@features': resolve(rootDir, 'src/features'),
      '@widgets': resolve(rootDir, 'src/widgets'),
      '@pages': resolve(rootDir, 'src/pages'),
    },
  },
})
