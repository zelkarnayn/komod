import { describe, expect, it } from 'vitest';
import { parseCsv } from '@/shared/lib';
import { parseSolutionsSheet } from './solutions.sheet';

/** Заголовки как в komod-catalog-test.xlsx. */
const HEADER = [
  'Артикул комплекта',
  'Название',
  'Комната',
  'Стиль',
  'Описание',
  'Состав (артикулы товаров через запятую)',
  'Сумма товаров, ₽ (считается сама)',
  'Цена комплекта, ₽ (только если отличается от суммы)',
  'Фото обложки (если пусто, берётся фото первого товара)',
  'Дата проверки цены и наличия',
  'Актуальность',
]
  .map((title) => `"${title}"`)
  .join(',');

/**
 * Разбирает лист из заголовка и строк.
 * @param lines - строки данных CSV
 */
const parse = (...lines: string[]) => parseSolutionsSheet(parseCsv([HEADER, ...lines].join('\n')));

describe('parseSolutionsSheet', () => {
  it('собирает комплект; сумму из таблицы не берёт', () => {
    const { items, issues } = parse(
      'KS-003,Гостиная-столовая,Гостиная,Современная классика,Описание,"KM-001, KM-002, KM-004",440000,"410 000",,46313,актуально',
      'KS-001,Оливковая,Гостиная,Современная классика,,"KM-001, KM-004",320000,,cover.jpg,46313,актуально',
    );
    expect(issues).toEqual([]);
    expect(items).toEqual([
      {
        id: 'KS-003',
        name: 'Гостиная-столовая',
        room: 'living',
        style: 'modern-classic',
        description: 'Описание',
        productIds: ['KM-001', 'KM-002', 'KM-004'],
        price: 410000,
        cover: null,
      },
      {
        id: 'KS-001',
        name: 'Оливковая',
        room: 'living',
        style: 'modern-classic',
        description: '',
        productIds: ['KM-001', 'KM-004'],
        price: null,
        cover: '/products/cover.jpg',
      },
    ]);
  });

  it.each([
    ['пустой стиль', 'KS-002,Столовая,Кухня и столовая,,,KM-002,,,,,', 'пустое поле «Стиль»'],
    ['неизвестная комната', 'KS-002,Столовая,Кухня,Прованс,,KM-002,,,,,', 'неизвестное значение «Кухня»'],
    ['пустой состав', 'KS-002,Столовая,Кухня и столовая,Прованс,,,,,,,', 'пустое поле «Состав»'],
    ['мусор в цене', 'KS-002,Столовая,Кухня и столовая,Прованс,,KM-002,,около 200000,,,', '«Цена комплекта»'],
  ])('пропускает строку: %s', (_, line, message) => {
    const { items, issues } = parse(line);
    expect(items).toEqual([]);
    expect(issues[0]).toMatchObject({ sheet: 'Комплекты', row: 2 });
    expect(issues[0]?.message).toContain(message);
  });
});
