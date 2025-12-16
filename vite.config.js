import { defineConfig } from 'vite'

export default defineConfig({
  base: '/GP/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['three'] // example
        }
      }
    }
  }
})
