import type { Room, Style } from '@/entities/product/@x/solution';

/** Готовое решение: набор товаров, который продаётся как цельный интерьер. */
export interface Solution {
  /** Артикул комплекта, например KS-001 */
  id: string;
  name: string;
  room: Room;
  style: Style;
  description: string;
  /** Артикулы товаров в составе, в порядке показа */
  productIds: readonly string[];
  /** Цена комплекта, если она отличается от суммы товаров; иначе null */
  price: number | null;
  /** Своя обложка; null — берётся фото первого товара */
  cover: string | null;
}
