import { SHEET_COLUMNS } from '@/shared/config';
import { CellError, invertLabels, normalizeKey, readSheet, resolveImageSrc } from '@/shared/lib';
import type { RowReader, SheetResult } from '@/shared/lib';
import { AVAILABILITY_LABELS, ROOM_LABELS, STYLE_LABELS } from '../model/labels';
import type { Dimensions, Product } from '../model/types';

const ROOM_CODES = invertLabels(ROOM_LABELS);
const STYLE_CODES = invertLabels(STYLE_LABELS);
const AVAILABILITY_CODES = invertLabels(AVAILABILITY_LABELS);

const { sheet: SHEET, required: COLUMNS, optional: OPTIONAL_COLUMNS } = SHEET_COLUMNS.products;

type Column = (typeof COLUMNS)[number] | (typeof OPTIONAL_COLUMNS)[number];

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
 * и возвращаются в issues, скрытые товары — молча.
 * @param rows - строки листа, первая — заголовки
 * @param photos - фото с Google Диска по артикулу; у кого их нет, берутся из «Ссылки на фото»
 */
export function parseProductsSheet(
  rows: readonly (readonly string[])[],
  photos: Readonly<Record<string, readonly string[]>> = {},
): SheetResult<Product> {
  return readSheet(rows, {
    sheet: SHEET,
    columns: COLUMNS,
    optionalColumns: OPTIONAL_COLUMNS,
    keyOf: (product) => product.id,
    parseRow: (row) => {
      if (normalizeKey(row.text('На сайте')) === 'нет') return null;
      const id = row.required('Артикул');
      return {
        id,
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
        images: photos[id] ?? row.list('Ссылка на фото').map(resolveImageSrc),
        relatedIds: row.list('Сочетается с'),
      };
    },
  });
}
