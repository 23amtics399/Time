import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        // Each tool is already a separate chunk via React.lazy
        // Keep vendor chunk separate for better caching
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor';
          }
        },
      },
    },
  },
})
