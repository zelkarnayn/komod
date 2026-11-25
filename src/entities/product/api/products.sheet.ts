import { CellError, invertLabels, readSheet, resolveImageSrc } from '@/shared/lib';
import type { RowReader, SheetResult } from '@/shared/lib';
import { AVAILABILITY_LABELS, ROOM_LABELS, STYLE_LABELS } from '../model/labels';
import type { Dimensions, Product } from '../model/types';

const ROOM_CODES = invertLabels(ROOM_LABELS);
const STYLE_CODES = invertLabels(STYLE_LABELS);
const AVAILABILITY_CODES = invertLabels(AVAILABILITY_LABELS);

/**
 * Столбцы листа «Товары», которые попадают на сайт. Ищутся по началу заголовка
 * до запятой или скобки («Цена, ₽» → «Цена»). Артикул поставщика, поставщик,
 * дата проверки и актуальность здесь намеренно не перечислены и не читаются.
 */
const COLUMNS = [
  'Артикул',
  'Название',
  'Комната',
  'Тип товара',
  'Стиль',
  'Цвет',
  'Материал',
  'Ширина',
  'Глубина',
  'Высота',
  'Цена',
  'Наличие',
  'Срок поставки',
  'Сочетается с',
  'Описание',
  'Ссылка на фото',
] as const;

type Column = (typeof COLUMNS)[number];

/**
 * Читает размеры: все три пустые — размеров нет, заполнены частично — ошибка строки.
 * @param row - строка листа
 */
function readDimensions(row: RowReader<Column>): Dimensions | null {
  const width = row.number('Ширина', { positive: true });
  const depth = row.number('Глубина', { positive: true });
  const height = row.number('Высота', { positive: true });
  if (width === null && depth === null && height === null) return null;
  if (width === null || depth === null || height === null) {
    throw new CellError('размеры заполнены не полностью: нужны ширина, глубина и высота');
  }
  return { width, depth, height };
}

/**
 * Превращает лист «Товары» в товары сайта. Строки с ошибками пропускаются
 * и возвращаются в issues.
 * @param rows - строки CSV, первая — заголовки
 */
export function parseProductsSheet(rows: readonly (readonly string[])[]): SheetResult<Product> {
  return readSheet(rows, {
    sheet: 'Товары',
    columns: COLUMNS,
    keyOf: (product) => product.id,
    parseRow: (row) => ({
      id: row.required('Артикул'),
      name: row.required('Название'),
      room: row.code('Комната', ROOM_CODES),
      kind: row.text('Тип товара'),
      style: row.code('Стиль', STYLE_CODES),
      color: row.text('Цвет'),
      material: row.text('Материал'),
      dimensions: readDimensions(row),
      price: row.number('Цена', { positive: true }),
      availability: row.code('Наличие', AVAILABILITY_CODES),
      leadTimeDays: row.number('Срок поставки', { integer: true, positive: true }),
      description: row.text('Описание'),
      images: row.list('Ссылка на фото').map(resolveImageSrc),
      relatedIds: row.list('Сочетается с'),
    }),
  });
}
