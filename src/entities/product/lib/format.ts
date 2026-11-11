import { AVAILABILITY_LABELS } from '../model/labels';
import type { Dimensions, Product } from '../model/types';

/**
 * Текст о наличии: «В шоуруме», «Под заказ, около 45 дней».
 * Если срок под заказ неизвестен, его не выдумываем.
 * @param product - товар (нужны наличие и срок поставки)
 */
export function getAvailabilityText(product: Pick<Product, 'availability' | 'leadTimeDays'>): string {
  const label = AVAILABILITY_LABELS[product.availability];
  if (product.availability === 'on-order' && product.leadTimeDays !== null) {
    return `${label}, около ${product.leadTimeDays} дн.`;
  }
  return label;
}

/**
 * Форматирует размеры: «213 × 104 × 81 см».
 * @param dimensions - размеры в сантиметрах или null, если неизвестны
 */
export function formatDimensions(dimensions: Dimensions | null): string | null {
  if (dimensions === null) return null;
  return `${dimensions.width} × ${dimensions.depth} × ${dimensions.height} см`;
}
