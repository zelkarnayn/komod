/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { catalogSource } from './build/catalog-source.ts';
import { prerender } from './build/prerender.ts';

/** Временная папка серверной сборки: нужна только на время пререндера */
const SERVER_OUT_DIR = 'dist-server';

export default defineConfig({
  plugins: [react(), catalogSource()],
  resolve: {
    // Алиас «@» указывает на src, чтобы не писать длинные относительные пути
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  environments: {
    // Серверная сборка: из неё пререндер получает готовый HTML каждой страницы
    ssr: { build: { ssr: 'src/app/entry-server.tsx', outDir: SERVER_OUT_DIR } },
  },
  builder: {
    async buildApp(builder) {
      const { client, ssr } = builder.environments;
      if (!client || !ssr) throw new Error('Нет окружений client и ssr для сборки');
      await builder.build(client);
      await builder.build(ssr);
      await prerender({
        outDir: builder.config.build.outDir,
        serverEntry: `${SERVER_OUT_DIR}/entry-server.js`,
        serverOutDir: SERVER_OUT_DIR,
      });
    },
  },
  test: { include: ['src/**/*.test.ts'] },
});
