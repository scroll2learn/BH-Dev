// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',          // allow external access
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true        // required for some Docker setups
    },
    hmr: {
      clientPort: 5173        // ensure HMR uses correct port
    }
  }
})
