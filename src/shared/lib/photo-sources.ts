import { PHOTOS } from '../config/photos';

/** Атрибуты картинки: адрес и, для фото с Диска, варианты разной ширины. */
export interface PhotoSources {
  src: string;
  srcSet?: string;
  sizes?: string;
}

const LARGEST = PHOTOS.widths.at(-1);
/** Адрес самой большой версии фото с Диска: /photos/<артикул>/<хеш>-1600.webp */
const DRIVE_PHOTO = new RegExp(`^${PHOTOS.folder}.+-${LARGEST}\\.webp$`, 'u');

/**
 * Атрибуты src/srcSet/sizes для фото: браузер сам выберет ширину под экран.
 * Фото не с Диска (тестовые, по ссылке) отдаются как есть.
 * @param src - адрес фото из данных товара
 * @param sizes - ширина картинки на странице, например «(max-width: 600px) 50vw, 300px»
 */
export function photoSources(src: string, sizes: string): PhotoSources {
  if (!DRIVE_PHOTO.test(src)) return { src };
  const base = src.slice(0, -`-${LARGEST}.webp`.length);
  return {
    src,
    srcSet: PHOTOS.widths.map((width) => `${base}-${width}.webp ${width}w`).join(', '),
    sizes,
  };
}
