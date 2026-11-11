/** Комнаты каталога. Значения — латинские коды для адресной строки. */
export const ROOMS = ['living', 'bedroom', 'dining', 'hallway', 'kids', 'decor'] as const;
export type Room = (typeof ROOMS)[number];

export const STYLES = ['provence', 'french-country', 'american-country', 'modern-classic', 'quiet-luxury'] as const;
export type Style = (typeof STYLES)[number];

export const AVAILABILITIES = ['showroom', 'in-stock', 'on-order', 'unavailable'] as const;
export type Availability = (typeof AVAILABILITIES)[number];

/** Размеры в сантиметрах. */
export interface Dimensions {
  width: number;
  depth: number;
  height: number;
}

/**
 * Товар каталога — только то, что можно показывать клиентам.
 * Внутренние поля таблицы (артикул поставщика, поставщик) сюда не попадают.
 */
export interface Product {
  /** Артикул салона, например KM-001 */
  id: string;
  name: string;
  room: Room;
  /** Тип товара: «Диван», «Комод» и т. д. */
  kind: string;
  style: Style;
  color: string;
  material: string;
  dimensions: Dimensions | null;
  /** Цена в рублях; null — цена по запросу */
  price: number | null;
  availability: Availability;
  /** Срок поставки в днях, нужен для «Под заказ» */
  leadTimeDays: number | null;
  description: string;
  /** Пути к фото, первое — главное */
  images: readonly string[];
  /** Артикулы товаров, которые сочетаются с этим */
  relatedIds: readonly string[];
}
