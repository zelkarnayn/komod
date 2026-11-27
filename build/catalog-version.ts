/**
 * Печатает отпечаток текущей версии сайта: коммит, время правки таблицы и список фото.
 * Выкладка (.github/workflows/deploy.yml) сравнивает его с прошлым и пересобирает сайт только при изменениях.
 * Запуск без установки зависимостей: node build/catalog-version.ts
 */
import { createHash } from 'node:crypto';
import { connectGoogle, getModifiedTime, listPhotos, readGoogleConfig } from './google.ts';

const config = readGoogleConfig(process.env);
const client = await connectGoogle(config.serviceAccountKey);
const [sheetModified, photos] = await Promise.all([getModifiedTime(client, config.sheetId), listPhotos(client, config.photosFolderId)]);

const version = JSON.stringify({
  commit: process.env.GITHUB_SHA ?? '',
  sheetModified,
  photos: photos.map((photo) => [photo.productId, photo.name, photo.md5]),
});
console.log(createHash('sha256').update(version).digest('hex'));
