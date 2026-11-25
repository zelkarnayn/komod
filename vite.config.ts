/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

/**
 * Проверяет переменные источника данных при запуске и сборке.
 * Неверное значение VITE_DATA_SOURCE или режим sheets без адресов CSV — ошибка.
 * Сборка на тестовых данных (mock) не останавливается, но выводит заметное предупреждение.
 */
function dataSourceGuard(): Plugin {
  let isMockBuild = false;
  const warnMock = (log: (message: string) => void) =>
    log(
      [
        '',
        '\x1b[43m\x1b[30m ВНИМАНИЕ: СБОРКА НА ТЕСТОВЫХ ДАННЫХ (VITE_DATA_SOURCE=mock) \x1b[0m',
        '\x1b[33m  На сайте будут придуманные товары и цены.',
        '  Для боевой сборки задайте VITE_DATA_SOURCE=sheets и адреса CSV (см. .env.example).\x1b[0m',
        '',
      ].join('\n'),
    );

  return {
    name: 'komod:data-source-guard',
    configResolved(config) {
      const source = config.env.VITE_DATA_SOURCE || 'mock';
      if (source !== 'mock' && source !== 'sheets') {
        throw new Error(`VITE_DATA_SOURCE=${source}: допустимы только mock и sheets`);
      }
      if (source === 'sheets') {
        const missing = ['VITE_PRODUCTS_CSV_URL', 'VITE_SOLUTIONS_CSV_URL'].filter((name) => !config.env[name]);
        if (missing.length > 0) throw new Error(`VITE_DATA_SOURCE=sheets, но не заданы ${missing.join(', ')}`);
      }
      isMockBuild = config.command === 'build' && source === 'mock';
      if (isMockBuild) warnMock((message) => config.logger.warn(message));
    },
    // Повторяем в конце, чтобы предупреждение не утонуло в выводе сборки
    closeBundle() {
      if (isMockBuild) warnMock((message) => this.warn(message));
    },
  };
}

export default defineConfig({
  plugins: [react(), dataSourceGuard()],
  resolve: {
    // Алиас «@» указывает на src, чтобы не писать длинные относительные пути
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: { include: ['src/**/*.test.ts'] },
});
