/** Папка с фото товаров внутри public */
const IMAGES_FOLDER = '/products/';

/**
 * Превращает значение ячейки с фото в адрес картинки.
 * Ссылки (https://…) и пути от корня (/…) остаются как есть,
 * а имя файла («KM-001_main.jpg») ищется в папке public/products.
 * @param value - имя файла или ссылка из таблицы
 */
export function resolveImageSrc(value: string): string {
  return /^(?:https?:)?\/\/|^\//iu.test(value) ? value : `${IMAGES_FOLDER}${value}`;
}
