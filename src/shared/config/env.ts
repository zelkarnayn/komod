/**
 * Адреса опубликованных CSV для листов «Товары» и «Комплекты».
 * Сам переключатель VITE_DATA_SOURCE (mock | sheets) читается в fetchProducts и fetchSolutions,
 * а его значение проверяет плагин в vite.config.ts.
 */
export const SHEET_CSV_URLS = {
  products: import.meta.env.VITE_PRODUCTS_CSV_URL,
  solutions: import.meta.env.VITE_SOLUTIONS_CSV_URL,
} as const;
