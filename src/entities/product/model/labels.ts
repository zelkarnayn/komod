import type { Availability, Room, Style } from './types';

export const ROOM_LABELS: Record<Room, string> = {
  living: 'Гостиная',
  bedroom: 'Спальня',
  dining: 'Кухня и столовая',
  hallway: 'Прихожая',
  kids: 'Детская',
  decor: 'Декор и текстиль',
};

export const STYLE_LABELS: Record<Style, string> = {
  provence: 'Прованс',
  'french-country': 'Французский country',
  'american-country': 'Американский country',
  'modern-classic': 'Современная классика',
  'quiet-luxury': 'Quiet luxury',
};

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  showroom: 'В шоуруме',
  'in-stock': 'На складе',
  'on-order': 'Под заказ',
  unavailable: 'Нет в наличии',
};
