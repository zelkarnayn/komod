import { parseCsv } from '../lib';

/**
 * Загружает опубликованный CSV-лист (Google Sheets → «Опубликовать в интернете») и разбирает его.
 * @param url - адрес CSV; если не задан, бросает понятную ошибку
 * @returns строки таблицы, первая — заголовки
 */
export async function fetchCsv(url: string | undefined): Promise<string[][]> {
  if (!url) throw new Error('Не задан адрес CSV-листа (VITE_PRODUCTS_CSV_URL / VITE_SOLUTIONS_CSV_URL)');
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Не удалось загрузить таблицу: HTTP ${response.status}`);
  return parseCsv(await response.text());
}
