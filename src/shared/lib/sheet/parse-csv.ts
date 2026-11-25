/**
 * Разбирает CSV (RFC 4180), как его отдаёт «Опубликовать в интернете» в Google Sheets:
 * разделитель — запятая, значения в кавычках могут содержать запятые и переносы строк,
 * кавычка внутри значения удваивается (""). Понимает переносы \n и \r\n и BOM в начале.
 * @param text - содержимое CSV-файла
 * @returns строки таблицы, каждая — массив ячеек
 */
export function parseCsv(text: string): string[][] {
  const source = text.startsWith('﻿') ? text.slice(1) : text;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < source.length; i++) {
    const char = source.charAt(i);

    if (inQuotes) {
      if (char !== '"') field += char;
      else if (source.charAt(i + 1) === '"') {
        field += '"';
        i++;
      } else inQuotes = false;
      continue;
    }

    if (char === '"') inQuotes = true;
    else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && source.charAt(i + 1) === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += char;
  }

  // Последняя строка без переноса в конце файла
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}
