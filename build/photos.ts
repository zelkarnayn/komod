import { mkdir, rename, stat } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { PHOTOS } from '../src/shared/config/photos.ts';
import { downloadFile } from './google.ts';
import type { DrivePhoto, GoogleClient } from './google.ts';

/** Сколько фото скачивается и пережимается одновременно */
const CONCURRENCY = 4;
/** Артикул годится в адрес только из латиницы, цифр, дефиса и подчёркивания */
const SAFE_ID = /^[\w-]+$/u;

/** Готовые фото: что показать у каждого товара и какие файлы положить на сайт. */
export interface PreparedPhotos {
  /** Адреса фото по артикулу, первое — главное */
  byProduct: Record<string, string[]>;
  /** Файлы сайта: адрес без начального «/» → путь к готовому файлу в кэше */
  files: Map<string, string>;
}

/**
 * Проверяет, что файл уже есть в кэше.
 * @param path - путь к файлу
 */
async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Скачивает фото и пережимает в WebP всех ширин, если в кэше их ещё нет.
 * Кэш общий для всех сборок: ключ — контрольная сумма исходника, так что неизменённые фото не скачиваются.
 * @param client - клиент Google
 * @param photo - фото на Диске
 * @param cacheDir - папка кэша
 * @param name - имя файла без ширины и расширения
 */
async function convertPhoto(client: GoogleClient, photo: DrivePhoto, cacheDir: string, name: string): Promise<void> {
  const targets = PHOTOS.widths.map((width) => ({ width, path: join(cacheDir, `${name}-${width}.webp`) }));
  if ((await Promise.all(targets.map((target) => exists(target.path)))).every(Boolean)) return;

  const source = await downloadFile(client, photo.id);
  for (const target of targets) {
    const temporary = `${target.path}.tmp`;
    // rotate() без аргументов разворачивает фото по EXIF: снимки с телефона не лягут на бок
    await sharp(source).rotate().resize({ width: target.width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(temporary);
    // Переименование в конце: оборванная сборка не оставит в кэше полуготовый файл
    await rename(temporary, target.path);
  }
}

/**
 * Готовит фото товаров для сайта. Фото, которое не удалось обработать (например, HEIC),
 * пропускается с предупреждением: остальной сайт собирается.
 * @param client - клиент Google
 * @param photos - фото на Диске в нужном порядке
 * @param cacheDir - папка кэша готовых файлов
 * @param warn - куда писать предупреждения
 */
export async function preparePhotos(
  client: GoogleClient,
  photos: readonly DrivePhoto[],
  cacheDir: string,
  warn: (message: string) => void,
): Promise<PreparedPhotos> {
  await mkdir(cacheDir, { recursive: true });
  const usable = photos.filter((photo) => {
    if (SAFE_ID.test(photo.productId)) return true;
    warn(`Фото: папка «${photo.productId}» пропущена — название должно быть артикулом (латиница, цифры, дефис)`);
    return false;
  });

  const failed = new Set<DrivePhoto>();
  const queue = [...usable];
  const worker = async () => {
    for (let photo = queue.shift(); photo; photo = queue.shift()) {
      try {
        await convertPhoto(client, photo, cacheDir, photo.md5);
      } catch (error) {
        failed.add(photo);
        warn(`Фото: «${photo.productId}/${photo.name}» пропущено — ${(error as Error).message}`);
      }
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const byProduct: Record<string, string[]> = {};
  const files = new Map<string, string>();
  const largest = PHOTOS.widths.at(-1);
  for (const photo of usable) {
    if (failed.has(photo)) continue;
    // Десяти знаков хеша хватает, чтобы адреса не совпали, и адрес остаётся коротким
    const base = `${PHOTOS.folder}${photo.productId}/${photo.md5.slice(0, 10)}`;
    for (const width of PHOTOS.widths) files.set(`${base}-${width}.webp`.slice(1), join(cacheDir, `${photo.md5}-${width}.webp`));
    (byProduct[photo.productId] ??= []).push(`${base}-${largest}.webp`);
  }
  return { byProduct, files };
}
