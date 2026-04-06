import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    target: 'esnext',
    minify: 'terser', // High-quality minification
    terserOptions: {
      compress: {
        drop_console: true, // Removes console.logs for production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
        entryFileNames: `widget.bundle.js`, // Kept simple for CDN consistency
        format: 'iife', // Ensures no "export" errors on client sites
      },
    },
  },
});