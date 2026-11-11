const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

/**
 * Форматирует цену в рублях: 145000 → «145 000 ₽».
 * @param value - цена в рублях; null, если цена неизвестна
 * @returns строку с ценой или null, если цены нет
 */
export function formatPrice(value: number | null): string | null {
  return value === null ? null : priceFormatter.format(value);
}
