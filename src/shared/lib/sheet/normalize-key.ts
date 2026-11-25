/**
 * Приводит подпись к виду для сравнения: нижний регистр, «ё» → «е»,
 * любые пробелы (в том числе неразрывные) схлопнуты в один и обрезаны по краям.
 * @param value - исходная строка
 */
export function normalizeKey(value: string): string {
  return value.toLowerCase().replaceAll('ё', 'е').replace(/\s+/gu, ' ').trim();
}
