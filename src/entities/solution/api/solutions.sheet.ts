import { ROOM_LABELS, STYLE_LABELS } from '@/entities/product/@x/solution';
import { SHEET_COLUMNS } from '@/shared/config';
import { invertLabels, readSheet, resolveImageSrc, splitList } from '@/shared/lib';
import type { SheetResult } from '@/shared/lib';
import type { Solution } from '../model/types';

const ROOM_CODES = invertLabels(ROOM_LABELS);
const STYLE_CODES = invertLabels(STYLE_LABELS);

const { sheet: SHEET, required: COLUMNS } = SHEET_COLUMNS.solutions;

/**
 * Превращает лист «Комплекты» в готовые решения. Строки с ошибками пропускаются
 * и возвращаются в issues.
 * @param rows - строки CSV, первая — заголовки
 */
export function parseSolutionsSheet(rows: readonly (readonly string[])[]): SheetResult<Solution> {
  return readSheet(rows, {
    sheet: SHEET,
    columns: COLUMNS,
    keyOf: (solution) => solution.id,
    parseRow: (row) => {
      const cover = row.text('Фото обложки');
      return {
        id: row.required('Артикул комплекта'),
        name: row.required('Название'),
        room: row.code('Комната', ROOM_CODES),
        style: row.code('Стиль', STYLE_CODES),
        description: row.text('Описание'),
        // Комплект без состава показывать нечего, поэтому поле обязательное
        productIds: splitList(row.required('Состав')),
        price: row.number('Цена комплекта', { positive: true }),
        cover: cover === '' ? null : resolveImageSrc(cover),
      };
    },
  });
}
