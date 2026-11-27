import { warnSheetIssues } from '@/shared/lib';
import type { Product } from '../model/types';
import { parseProductsSheet } from './products.sheet';

/**
 * Загружает каталог товаров. Источник задаёт VITE_DATA_SOURCE:
 * mock — тестовые данные из products.data.ts, sheets — лист «Товары» и фото с Google Диска, прочитанные при сборке.
 * Строки таблицы с ошибками пропускаются (причины видны в консоли разработки и в выводе сборки).
 */
export async function fetchProducts(): Promise<readonly Product[]> {
  // Переменная проверяется прямо здесь: Vite подставляет её значение при сборке,
  // и ненужная ветка (тестовые данные или таблица) вырезается целиком
  if (import.meta.env.VITE_DATA_SOURCE !== 'sheets') return (await import('./products.data')).PRODUCTS;

  const { productsRows, photos } = await import('virtual:komod-catalog');
  const { items, issues } = parseProductsSheet(productsRows, photos);
  warnSheetIssues(issues);
  return items;
}
