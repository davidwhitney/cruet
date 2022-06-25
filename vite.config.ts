import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  root: "sample-app",
  server: {
    port: 8080
  },
  build: {
    outDir: "../dist",
    sourcemap: true,
    emptyOutDir: true
  },
  plugins: []
})
