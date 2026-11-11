import { AVAILABILITIES, ROOMS, STYLES } from '@/entities/product';
import type { Availability, Product, Room, Style } from '@/entities/product';
import { isOneOf } from '@/shared/lib';

/** Выбранные фильтры; null — фильтр не применён. */
export interface ProductFilters {
  room: Room | null;
  style: Style | null;
  availability: Availability | null;
}

export const EMPTY_FILTERS: ProductFilters = { room: null, style: null, availability: null };

/**
 * Разбирает фильтры из адресной строки. Неизвестные значения игнорирует,
 * поэтому испорченная ссылка не ломает каталог.
 * @param params - параметры адресной строки
 */
export function parseFilters(params: URLSearchParams): ProductFilters {
  const room = params.get('room');
  const style = params.get('style');
  const availability = params.get('availability');
  return {
    room: isOneOf(ROOMS, room) ? room : null,
    style: isOneOf(STYLES, style) ? style : null,
    availability: isOneOf(AVAILABILITIES, availability) ? availability : null,
  };
}

/**
 * Оставляет только товары, подходящие под все выбранные фильтры.
 * @param items - весь каталог
 * @param filters - выбранные фильтры
 */
export function filterProducts(items: readonly Product[], filters: ProductFilters): Product[] {
  return items.filter(
    (item) =>
      (filters.room === null || item.room === filters.room) &&
      (filters.style === null || item.style === filters.style) &&
      (filters.availability === null || item.availability === filters.availability),
  );
}

/** Есть ли хотя бы один выбранный фильтр. */
export function hasActiveFilters(filters: ProductFilters): boolean {
  return filters.room !== null || filters.style !== null || filters.availability !== null;
}
