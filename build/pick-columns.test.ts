import { describe, expect, it } from 'vitest';
import { SHEET_COLUMNS } from '../src/shared/config/sheet-columns.ts';
import { pickColumns } from './pick-columns.ts';

describe('pickColumns', () => {
  const rows = [
    ['Артикул', 'Артикул поставщика (внутренний)', 'Название', 'Цена, ₽', 'Поставщик', 'Закупочная цена', 'На сайте'],
    ['KM-001', 'SECRET', 'Диван', '100', 'Фабрика', '50', 'Да'],
    ['KM-002', 'SECRET2', 'Скрытый', '', '', '', ' нет '],
    ['KM-003', '', 'Без пометки'],
  ];

  it('оставляет только столбцы сайта и выбрасывает скрытые товары', () => {
    expect(pickColumns(rows, SHEET_COLUMNS.products)).toEqual([
      ['Артикул', 'Название', 'Цена, ₽', 'На сайте'],
      ['KM-001', 'Диван', '100', 'Да'],
      ['KM-003', 'Без пометки', '', ''],
    ]);
  });

  it('без столбца «На сайте» оставляет все строки', () => {
    const plain = rows.map((row) => row.slice(0, 3));
    expect(pickColumns(plain, SHEET_COLUMNS.products)).toHaveLength(4);
  });
});
