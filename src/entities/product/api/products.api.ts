import { fetchCsv } from '@/shared/api';
import { SHEET_CSV_URLS } from '@/shared/config';
import { warnSheetIssues } from '@/shared/lib';
import type { Product } from '../model/types';
import { parseProductsSheet } from './products.sheet';

/**
 * Загружает каталог товаров. Источник задаёт VITE_DATA_SOURCE:
 * mock — тестовые данные из products.data.ts, sheets — опубликованный CSV листа «Товары».
 * Строки таблицы с ошибками пропускаются (причины видны в консоли в режиме разработки).
 */
export async function fetchProducts(): Promise<readonly Product[]> {
  // Переменная проверяется прямо здесь, а не через shared/config: Vite подставляет её значение
  // при сборке, и в сборке на таблице файл с тестовыми данными вырезается целиком
  if (import.meta.env.VITE_DATA_SOURCE !== 'sheets') return (await import('./products.data')).PRODUCTS;

  const { items, issues } = parseProductsSheet(await fetchCsv(SHEET_CSV_URLS.products));
  warnSheetIssues(issues);
  return items;
}
