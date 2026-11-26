import { normalizeKey } from './normalize-key';
import { parseNumber } from './parse-number';

/** Причина, по которой строка таблицы не попала на сайт. */
export interface SheetIssue {
  sheet: string;
  /** Номер строки как в Google Sheets (заголовок — строка 1) */
  row: number;
  message: string;
}

export interface SheetResult<T> {
  items: T[];
  issues: SheetIssue[];
}

/** Ошибка в значении ячейки: строку пропускаем, остальные читаем дальше. */
export class CellError extends Error {}

export interface NumberOptions {
  /** Только целое число */
  integer?: boolean;
  /** Только больше нуля */
  positive?: boolean;
}

/** Доступ к ячейкам одной строки по названию столбца. При ошибке методы бросают CellError. */
export interface RowReader<C extends string> {
  /** Текст ячейки без пробелов по краям; пустая ячейка — '' */
  text(column: C): string;
  /** Текст обязательной ячейки */
  required(column: C): string;
  /** Число; пустая ячейка — null */
  number(column: C, options?: NumberOptions): number | null;
  /** Значения через запятую, точку с запятой или перенос строки */
  list(column: C): string[];
  /** Код по русской подписи из обратного словаря; ячейка обязательна */
  code<K>(column: C, dictionary: ReadonlyMap<string, K>): K;
}

export interface SheetSchema<C extends string, T> {
  /** Название листа для сообщений об ошибках */
  sheet: string;
  /** Столбцы, которые читаем; ищутся по заголовку, порядок в таблице не важен */
  columns: readonly C[];
  parseRow: (row: RowReader<C>) => T;
  /** Уникальный ключ записи: строки с повторным ключом пропускаются */
  keyOf: (item: T) => string;
}

/**
 * Возвращает основу заголовка для поиска столбца: текст до первой скобки или запятой.
 * «Цена, ₽» → «цена», «Сочетается с (артикулы через запятую)» → «сочетается с».
 * @param header - заголовок столбца
 */
export function headerKey(header: string): string {
  return normalizeKey(header.split(/[(,]/u, 1)[0] ?? '');
}

/**
 * Делит ячейку со списком на значения: «KM-001, KM-004» → ['KM-001', 'KM-004'].
 * @param value - текст ячейки
 */
export function splitList(value: string): string[] {
  return value
    .split(/[,;\n]/u)
    .map((item) => item.trim())
    .filter((item) => item !== '');
}

/**
 * Превращает строки листа в записи. Столбцы ищутся по заголовкам, лишние столбцы
 * (например, поставщик) игнорируются. Пустые строки пропускаются молча, строки
 * с ошибками — с записью причины в issues.
 * @param rows - строки CSV, первая — заголовки
 * @param schema - какие столбцы читать и как собрать запись
 * @throws {Error} если на листе нет нужного столбца: это ошибка структуры, а не одной строки
 */
export function readSheet<C extends string, T>(rows: readonly (readonly string[])[], schema: SheetSchema<C, T>): SheetResult<T> {
  const [header = [], ...body] = rows;
  const headerKeys = header.map(headerKey);
  const indexes = new Map<C, number>();
  const missing: C[] = [];
  for (const column of schema.columns) {
    const index = headerKeys.indexOf(headerKey(column));
    if (index === -1) missing.push(column);
    else indexes.set(column, index);
  }
  if (missing.length > 0) {
    throw new Error(`Лист «${schema.sheet}»: не найдены столбцы ${missing.map((column) => `«${column}»`).join(', ')}`);
  }

  const items: T[] = [];
  const issues: SheetIssue[] = [];
  const seenKeys = new Map<string, number>();

  body.forEach((cells, index) => {
    const rowNumber = index + 2;
    const cell = (column: C): string => (cells[indexes.get(column) ?? -1] ?? '').trim();
    if (schema.columns.every((column) => cell(column) === '')) return;

    try {
      const item = schema.parseRow(createRowReader(cell));
      const key = schema.keyOf(item);
      const firstRow = seenKeys.get(key);
      if (firstRow !== undefined) throw new CellError(`артикул ${key} уже есть в строке ${firstRow}`);
      seenKeys.set(key, rowNumber);
      items.push(item);
    } catch (error) {
      if (!(error instanceof CellError)) throw error;
      issues.push({ sheet: schema.sheet, row: rowNumber, message: error.message });
    }
  });

  return { items, issues };
}

/**
 * Создаёт RowReader поверх функции чтения ячейки.
 * @param cell - возвращает обрезанный текст ячейки по названию столбца
 */
function createRowReader<C extends string>(cell: (column: C) => string): RowReader<C> {
  const required = (column: C): string => {
    const value = cell(column);
    if (value === '') throw new CellError(`пустое поле «${column}»`);
    return value;
  };

  return {
    text: cell,
    required,
    number(column, { integer = false, positive = false } = {}) {
      let value: number | null;
      try {
        value = parseNumber(cell(column));
      } catch (error) {
        throw new CellError(`«${column}»: ${(error as Error).message}`);
      }
      if (value === null) return null;
      if (integer && !Number.isInteger(value)) throw new CellError(`«${column}»: нужно целое число, а не ${value}`);
      if (positive && value <= 0) throw new CellError(`«${column}»: нужно число больше нуля, а не ${value}`);
      return value;
    },
    list: (column) => splitList(cell(column)),
    code(column, dictionary) {
      const value = required(column);
      const code = dictionary.get(normalizeKey(value));
      if (code === undefined) throw new CellError(`«${column}»: неизвестное значение «${value}»`);
      return code;
    },
  };
}

/**
 * Выводит в консоль, какие строки таблицы пропущены и почему: при разработке и при пререндере.
 * В браузере у посетителей молчит.
 * @param issues - причины пропуска из readSheet
 */
export function warnSheetIssues(issues: readonly SheetIssue[]): void {
  // В браузере — только при разработке, при сборке — всегда: так ошибки таблицы видны в логе сборки
  if ((!import.meta.env.DEV && !import.meta.env.SSR) || issues.length === 0) return;
  const lines = issues.map((issue) => `  «${issue.sheet}», строка ${issue.row}: ${issue.message}`);
  console.warn(`Таблица: пропущено строк — ${issues.length}\n${lines.join('\n')}`);
}
