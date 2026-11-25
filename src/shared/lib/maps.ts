/** Точка на карте в градусах. */
export interface GeoPoint {
  lat: number;
  lon: number;
}

/**
 * Адрес встраиваемой Яндекс Карты (iframe) с меткой в точке. Ключ API не нужен.
 * @param point - координаты метки
 * @param zoom - масштаб, 16 — уровень улиц и домов
 */
export function buildYandexMapEmbedUrl(point: GeoPoint, zoom = 16): string {
  const coords = `${point.lon},${point.lat}`;
  return `https://yandex.ru/map-widget/v1/?ll=${encodeURIComponent(coords)}&z=${zoom}&pt=${encodeURIComponent(`${coords},pm2rdm`)}`;
}

/**
 * Ссылка «Построить маршрут» в Яндекс Картах: откуда — текущее место клиента, куда — точка.
 * @param point - точка назначения
 */
export function buildYandexRouteUrl(point: GeoPoint): string {
  return `https://yandex.ru/maps/?rtext=${encodeURIComponent(`~${point.lat},${point.lon}`)}`;
}

/**
 * Ссылка «Построить маршрут» в 2ГИС: откуда — текущее место клиента, куда — организация.
 * Без номера организации 2ГИС подставляет вместо здания весь город, поэтому номер обязателен.
 * @param point - точка организации в 2ГИС
 * @param firmId - номер организации из адреса её карточки (2gis.ru/…/firm/<номер>)
 */
export function build2GisRouteUrl(point: GeoPoint, firmId: string): string {
  return `https://2gis.ru/directions/points/${encodeURIComponent(`|${point.lon},${point.lat};${firmId}`)}`;
}
