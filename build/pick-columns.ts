/** Столбец, которым админка скрывает товар с сайта */
const HIDDEN_COLUMN = 'На сайте';

/**
 * Основа заголовка для сравнения, как headerKey в shared/lib/sheet: текст до запятой или скобки,
 * нижний регистр, «ё» → «е», пробелы схлопнуты.
 * @param header - заголовок столбца
 */
function columnKey(header: string): string {
  return (header.split(/[(,]/u, 1)[0] ?? '').toLowerCase().replaceAll('ё', 'е').replace(/\s+/gu, ' ').trim();
}

/**
 * Оставляет в листе только столбцы, нужные сайту (shared/config/sheet-columns.ts).
 * Остальные — поставщик, внутренние пометки — не должны попасть в файлы сайта.
 * @param rows - строки листа, первая — заголовки
 * @param columns - столбцы, которые сайт читает
 */
export function pickColumns(rows: readonly string[][], columns: { required: readonly string[]; optional: readonly string[] }): string[][] {
  const header = rows[0] ?? [];
  const allowed = new Set([...columns.required, ...columns.optional].map(columnKey));
  const indexes = header.flatMap((title, index) => (allowed.has(columnKey(title)) ? [index] : []));
  // Скрытые товары («На сайте: Нет») не попадают в файлы сайта вовсе
  const hiddenIndex = header.findIndex((title) => columnKey(title) === columnKey(HIDDEN_COLUMN));
  return rows
    .filter((row, index) => index === 0 || hiddenIndex === -1 || columnKey(row[hiddenIndex] ?? '') !== 'нет')
    .map((row) => indexes.map((index) => row[index] ?? ''));
}
