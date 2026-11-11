import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Алиас «@» указывает на src, чтобы не писать длинные относительные пути
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
