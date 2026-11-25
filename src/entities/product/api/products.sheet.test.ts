import { describe, expect, it } from 'vitest';
import { parseCsv } from '@/shared/lib';
import { parseProductsSheet } from './products.sheet';

/** Заголовки как в komod-catalog-test.xlsx, но столбцы переставлены. */
const HEADER = [
  'Название',
  'Артикул',
  'Артикул поставщика (внутренний, на сайте не показывать)',
  'Стиль',
  'Комната',
  'Тип товара',
  'Цвет',
  'Материал',
  'Ширина, см',
  'Глубина, см',
  'Высота, см',
  'Цена, ₽',
  'Наличие',
  'Срок поставки, дней',
  'Поставщик',
  'Сочетается с (артикулы через запятую)',
  'Описание',
  'Ссылка на фото',
  'Дата проверки цены и наличия',
  'Актуальность',
]
  .map((title) => `"${title}"`)
  .join(',');

const VALID =
  '"Диван 3-местный, оливковый",KM-001,PHDEFT250109,Современная классика,Гостиная,Диван,Оливково-зелёный,"Ткань, массив дерева",213,104,81,"185 000",В шоуруме,,Фабрика А,"KM-003, KM-004",Глубокая посадка.,KM-001_main.jpg,46313,актуально';

/**
 * Разбирает лист из заголовка и строк.
 * @param lines - строки данных CSV
 */
const parse = (...lines: string[]) => parseProductsSheet(parseCsv([HEADER, ...lines].join('\n')));

describe('parseProductsSheet', () => {
  it('собирает товар, переводит подписи в коды', () => {
    const { items, issues } = parse(VALID);
    expect(issues).toEqual([]);
    expect(items).toEqual([
      {
        id: 'KM-001',
        name: 'Диван 3-местный, оливковый',
        room: 'living',
        kind: 'Диван',
        style: 'modern-classic',
        color: 'Оливково-зелёный',
        material: 'Ткань, массив дерева',
        dimensions: { width: 213, depth: 104, height: 81 },
        price: 185000,
        availability: 'showroom',
        leadTimeDays: null,
        description: 'Глубокая посадка.',
        images: ['/products/KM-001_main.jpg'],
        relatedIds: ['KM-003', 'KM-004'],
      },
    ]);
  });

  it('не пропускает на сайт поставщика, его артикул и дату проверки', () => {
    const serialized = JSON.stringify(parse(VALID).items);
    expect(serialized).not.toContain('PHDEFT250109');
    expect(serialized).not.toContain('Фабрика А');
    expect(serialized).not.toContain('46313');
  });

  it('«Под заказ» со сроком, пустая цена и размеры — null', () => {
    const { items } = parse('Стол,KM-002,,Прованс,кухня и столовая,Стол,,,,,,,Под заказ,45,,,,,,');
    expect(items[0]).toMatchObject({ room: 'dining', availability: 'on-order', leadTimeDays: 45, price: null, dimensions: null, images: [] });
  });

  it.each([
    ['пустой артикул', ',,,Прованс,Спальня,,,,,,,,На складе,,,,,,,', 'пустое поле «Артикул»'],
    ['пустая комната', 'Комод,KM-003,,Прованс,,,,,,,,,На складе,,,,,,,', 'пустое поле «Комната»'],
    ['неизвестный стиль', 'Комод,KM-003,,Лофт,Спальня,,,,,,,,На складе,,,,,,,', 'неизвестное значение «Лофт»'],
    ['пустое наличие', 'Комод,KM-003,,Прованс,Спальня,,,,,,,,,,,,,,,', 'пустое поле «Наличие»'],
    ['мусор в цене', 'Комод,KM-003,,Прованс,Спальня,,,,,,,12о00,На складе,,,,,,,', '«Цена»'],
    ['цена «от»', 'Комод,KM-003,,Прованс,Спальня,,,,,,,от 100,На складе,,,,,,,', '«Цена»'],
    ['дробный срок', 'Комод,KM-003,,Прованс,Спальня,,,,,,,,Под заказ,"4,5",,,,,,', 'целое число'],
    ['размеры частично', 'Комод,KM-003,,Прованс,Спальня,,,,120,,85,,На складе,,,,,,,', 'размеры заполнены не полностью'],
  ])('пропускает строку: %s', (_, line, message) => {
    const { items, issues } = parse(VALID, line);
    expect(items.map((item) => item.id)).toEqual(['KM-001']);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ sheet: 'Товары', row: 3 });
    expect(issues[0]?.message).toContain(message);
  });

  it('пустые строки шаблона (с формулой «Актуальность») пропускает молча', () => {
    const { items, issues } = parse(VALID, ',,,,,,,,,,,,,,,,,,,устарело', '');
    expect(items).toHaveLength(1);
    expect(issues).toEqual([]);
  });
});
