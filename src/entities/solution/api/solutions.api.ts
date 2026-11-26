import { parseCsv, warnSheetIssues } from '@/shared/lib';
import type { Solution } from '../model/types';
import { parseSolutionsSheet } from './solutions.sheet';

/**
 * Загружает готовые решения. Источник задаёт VITE_DATA_SOURCE:
 * mock — тестовые данные из solutions.data.ts, sheets — лист «Комплекты», скачанный при сборке.
 * Строки таблицы с ошибками пропускаются (причины видны в консоли разработки и в выводе сборки).
 */
export async function fetchSolutions(): Promise<readonly Solution[]> {
  // Переменная проверяется прямо здесь: Vite подставляет её значение при сборке,
  // и ненужная ветка (тестовые данные или таблица) вырезается целиком
  if (import.meta.env.VITE_DATA_SOURCE !== 'sheets') return (await import('./solutions.data')).SOLUTIONS;

  const { solutionsCsv } = await import('virtual:komod-catalog');
  const { items, issues } = parseSolutionsSheet(parseCsv(solutionsCsv));
  warnSheetIssues(issues);
  return items;
}
