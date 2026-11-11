/**
 * Проверяет, что значение входит в список допустимых строк, и сужает его тип.
 * Нужна для безопасного разбора параметров из адресной строки.
 * @param list - допустимые значения
 * @param value - проверяемое значение
 */
export function isOneOf<T extends string>(list: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && (list as readonly string[]).includes(value);
}
