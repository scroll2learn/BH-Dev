import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',  // Make sure the server is bound to all network interfaces
    port: 5173,       // Ensure the correct port
  },
});
