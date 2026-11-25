import { describe, expect, it } from 'vitest';
import { invertLabels } from './invert-labels';
import { parseCsv } from './parse-csv';
import { parseNumber } from './parse-number';
import { headerKey, readSheet, splitList } from './read-sheet';
import { resolveImageSrc } from './resolve-image-src';

describe('parseCsv', () => {
  it('разбирает простые строки и CRLF', () => {
    expect(parseCsv('a,b\r\n1,2\r\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  it('понимает кавычки, запятые и переносы внутри значения', () => {
    expect(parseCsv('"Диван, 3-местный","Строка 1\nСтрока 2","Он сказал ""да"""')).toEqual([
      ['Диван, 3-местный', 'Строка 1\nСтрока 2', 'Он сказал "да"'],
    ]);
  });

  it('убирает BOM и сохраняет пустые ячейки', () => {
    expect(parseCsv('﻿a,,c\n,,')).toEqual([
      ['a', '', 'c'],
      ['', '', ''],
    ]);
  });
});

describe('parseNumber', () => {
  it.each([
    ['185000', 185000],
    ['185 000', 185000],
    ['185 000', 185000],
    ['1 234 567', 1234567],
    ['1 234,5', 1234.5],
    ['1234.5', 1234.5],
    ['  81 ', 81],
    ['120,25', 120.25],
  ])('«%s» → %d', (raw, expected) => {
    expect(parseNumber(raw)).toBe(expected);
  });

  it('пустая ячейка — null', () => {
    expect(parseNumber('')).toBeNull();
    expect(parseNumber('  ')).toBeNull();
  });

  it.each(['от 100', '12о00', '1 2', '12 0000', '1,2,3', '100 ₽', '1,250', '1.250', 'abc'])('«%s» — ошибка', (raw) => {
    expect(() => parseNumber(raw)).toThrow(SyntaxError);
  });
});

describe('invertLabels', () => {
  it('находит код без учёта регистра, пробелов и ё', () => {
    const codes = invertLabels({ green: 'Зелёный', 'quiet-luxury': 'Quiet luxury' });
    expect(codes.get('зеленый')).toBe('green');
    expect(codes.get('quiet luxury')).toBe('quiet-luxury');
  });
});

describe('headerKey и splitList', () => {
  it('берёт основу заголовка до запятой или скобки', () => {
    expect(headerKey('Цена, ₽')).toBe('цена');
    expect(headerKey('Сочетается с (артикулы через запятую)')).toBe('сочетается с');
    expect(headerKey('  Артикул поставщика (внутренний)')).toBe('артикул поставщика');
  });

  it('делит список и выбрасывает пустые значения', () => {
    expect(splitList('KM-001, KM-004,,\nKM-005; ')).toEqual(['KM-001', 'KM-004', 'KM-005']);
    expect(splitList('')).toEqual([]);
  });
});

describe('resolveImageSrc', () => {
  it('имя файла — из public/products, ссылки и пути — как есть', () => {
    expect(resolveImageSrc('KM-001_main.jpg')).toBe('/products/KM-001_main.jpg');
    expect(resolveImageSrc('https://example.com/a.jpg')).toBe('https://example.com/a.jpg');
    expect(resolveImageSrc('/img/a.jpg')).toBe('/img/a.jpg');
  });
});

describe('readSheet', () => {
  const schema = {
    sheet: 'Тест',
    columns: ['Код', 'Цена'] as const,
    keyOf: (item: { id: string }) => item.id,
    parseRow: (row: import('./read-sheet').RowReader<'Код' | 'Цена'>) => ({
      id: row.required('Код'),
      price: row.number('Цена', { positive: true }),
    }),
  };

  it('ищет столбцы по заголовкам, а не по порядку', () => {
    const rows = parseCsv('Лишний,"Цена, ₽",Код\nx,"1 500",A\n');
    expect(readSheet(rows, schema)).toEqual({ items: [{ id: 'A', price: 1500 }], issues: [] });
  });

  it('пропускает плохие строки с номером строки, пустые — молча', () => {
    const rows = parseCsv('Код,Цена\nA,100\n,\n,200\nB,abc\nC,-5\nA,300\nD,\n');
    const { items, issues } = readSheet(rows, schema);
    expect(items).toEqual([
      { id: 'A', price: 100 },
      { id: 'D', price: null },
    ]);
    expect(issues.map((issue) => issue.row)).toEqual([4, 5, 6, 7]);
    expect(issues[0]?.message).toContain('пустое поле «Код»');
    expect(issues[3]?.message).toContain('уже есть в строке 2');
  });

  it('без нужного столбца бросает ошибку структуры', () => {
    expect(() => readSheet(parseCsv('Код\nA'), schema)).toThrow('не найдены столбцы «Цена»');
  });
});
