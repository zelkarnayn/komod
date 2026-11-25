import { fetchCsv } from '@/shared/api';
import { SHEET_CSV_URLS } from '@/shared/config';
import { warnSheetIssues } from '@/shared/lib';
import type { Solution } from '../model/types';
import { parseSolutionsSheet } from './solutions.sheet';

/**
 * Загружает готовые решения. Источник задаёт VITE_DATA_SOURCE:
 * mock — тестовые данные из solutions.data.ts, sheets — опубликованный CSV листа «Комплекты».
 * Строки таблицы с ошибками пропускаются (причины видны в консоли в режиме разработки).
 */
export async function fetchSolutions(): Promise<readonly Solution[]> {
  // Переменная проверяется прямо здесь, а не через shared/config: Vite подставляет её значение
  // при сборке, и в сборке на таблице файл с тестовыми данными вырезается целиком
  if (import.meta.env.VITE_DATA_SOURCE !== 'sheets') return (await import('./solutions.data')).SOLUTIONS;

  const { items, issues } = parseSolutionsSheet(await fetchCsv(SHEET_CSV_URLS.solutions));
  warnSheetIssues(issues);
  return items;
}
