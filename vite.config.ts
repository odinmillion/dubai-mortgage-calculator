import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), {
    name: 'copy-cname',
    closeBundle() {
      fs.copyFileSync('CNAME', resolve(__dirname, 'dist/CNAME'))
    }
  }],
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})
