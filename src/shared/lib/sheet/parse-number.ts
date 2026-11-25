/** Целая часть без разделителей или с пробелами по три цифры; дробная — через запятую или точку. */
const NUMBER_PATTERN = /^-?(?:\d+|\d{1,3}(?: \d{3})+)(?:[.,](\d+))?$/u;

/**
 * Разбирает число из ячейки таблицы: «185000», «185 000», «185 000» (неразрывный пробел),
 * «1 234,5», «1234.5».
 * Ровно три цифры после запятой или точки («1,250») не принимаются: это может быть
 * и 1,25, и 1250 в английском формате, поэтому лучше пропустить строку, чем угадать.
 * @param raw - текст ячейки
 * @returns число; null, если ячейка пустая
 * @throws {SyntaxError} если в ячейке не число («от 100», «12о00», «1 2»)
 */
export function parseNumber(raw: string): number | null {
  const text = raw.replace(/\s+/gu, ' ').trim();
  if (text === '') return null;

  const match = NUMBER_PATTERN.exec(text);
  if (!match) throw new SyntaxError(`«${text}» — не число`);
  if (match[1]?.length === 3) throw new SyntaxError(`«${text}» — непонятно, дробь это или тысячи`);

  return Number(text.replaceAll(' ', '').replace(',', '.'));
}
