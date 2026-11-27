/**
 * Чтение таблицы и папки с фото через API Google от имени сервисного аккаунта.
 * Без сторонних зависимостей: файл запускается и из Vite, и напрямую через node (build/catalog-version.ts).
 */
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';

/** Права только на чтение: сборка ничего не меняет ни в таблице, ни на Диске. */
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly', 'https://www.googleapis.com/auth/drive.readonly'];
const FOLDER_MIME = 'application/vnd.google-apps.folder';

/** Настройки доступа к Google из переменных окружения. */
export interface GoogleConfig {
  /** ID таблицы из её адреса: docs.google.com/spreadsheets/d/<ID>/edit */
  sheetId: string;
  /** ID корневой папки с фото: внутри папки товаров, названные артикулами */
  photosFolderId: string;
  /** Ключ сервисного аккаунта: JSON целиком или путь к JSON-файлу */
  serviceAccountKey: string;
}

/** Имена переменных окружения с настройками Google. */
export const GOOGLE_ENV = {
  sheetId: 'GOOGLE_SHEET_ID',
  photosFolderId: 'GOOGLE_PHOTOS_FOLDER_ID',
  serviceAccountKey: 'GOOGLE_SERVICE_ACCOUNT_KEY',
} as const satisfies Record<keyof GoogleConfig, string>;

/**
 * Собирает настройки Google из переменных окружения.
 * @param env - переменные окружения
 * @throws {Error} со списком незаданных переменных
 */
export function readGoogleConfig(env: Record<string, string | undefined>): GoogleConfig {
  const missing = Object.values(GOOGLE_ENV).filter((name) => !env[name]);
  if (missing.length > 0) throw new Error(`Не заданы ${missing.join(', ')} (см. .env.example)`);
  return {
    sheetId: env[GOOGLE_ENV.sheetId] ?? '',
    photosFolderId: env[GOOGLE_ENV.photosFolderId] ?? '',
    serviceAccountKey: env[GOOGLE_ENV.serviceAccountKey] ?? '',
  };
}

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  token_uri: string;
}

/** Клиент API Google с готовым токеном доступа. */
export interface GoogleClient {
  /** GET-запрос, ответ в JSON */
  json<T>(url: string): Promise<T>;
  /** GET-запрос, ответ как двоичные данные */
  buffer(url: string): Promise<Buffer>;
}

/**
 * Читает ключ сервисного аккаунта: строку JSON или путь к файлу.
 * @param value - значение GOOGLE_SERVICE_ACCOUNT_KEY
 */
function parseKey(value: string): ServiceAccountKey {
  const text = value.trim().startsWith('{') ? value : readFileSync(value, 'utf8');
  const key = JSON.parse(text) as Partial<ServiceAccountKey>;
  if (!key.client_email || !key.private_key) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY: это не ключ сервисного аккаунта');
  return { client_email: key.client_email, private_key: key.private_key, token_uri: key.token_uri ?? 'https://oauth2.googleapis.com/token' };
}

/**
 * Получает токен доступа по подписанному JWT (OAuth для сервисных аккаунтов).
 * @param key - ключ сервисного аккаунта
 */
async function requestToken(key: ServiceAccountKey): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
    iss: key.client_email,
    scope: SCOPES.join(' '),
    aud: key.token_uri,
    iat: now,
    exp: now + 3600,
  })}`;
  const signature = createSign('RSA-SHA256').update(unsigned).sign(key.private_key, 'base64url');

  const response = await fetch(key.token_uri, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` }),
  });
  if (!response.ok) throw new Error(`Google не выдал доступ сервисному аккаунту: HTTP ${response.status} ${await response.text()}`);
  return ((await response.json()) as { access_token: string }).access_token;
}

/**
 * Подключается к Google от имени сервисного аккаунта.
 * @param serviceAccountKey - JSON ключа или путь к файлу с ним
 */
export async function connectGoogle(serviceAccountKey: string): Promise<GoogleClient> {
  const token = await requestToken(parseKey(serviceAccountKey));
  const request = async (url: string) => {
    const response = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
    if (!response.ok) {
      const hint = response.status === 403 || response.status === 404 ? ' (поделились ли таблицей и папкой с сервисным аккаунтом?)' : '';
      throw new Error(`Google API: HTTP ${response.status}${hint}: ${url}`);
    }
    return response;
  };
  return {
    json: async <T>(url: string) => (await (await request(url)).json()) as T,
    buffer: async (url: string) => Buffer.from(await (await request(url)).arrayBuffer()),
  };
}

/**
 * Читает лист таблицы целиком в том виде, как он показан (форматированные значения).
 * @param client - клиент Google
 * @param sheetId - ID таблицы
 * @param sheetName - название листа
 */
export async function readSheetRows(client: GoogleClient, sheetId: string, sheetName: string): Promise<string[][]> {
  const range = encodeURIComponent(`'${sheetName}'`);
  const data = await client.json<{ values?: string[][] }>(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`);
  return data.values ?? [];
}

interface DriveFile {
  id: string;
  name: string;
  md5Checksum?: string;
  parents?: string[];
}

/**
 * Перебирает все страницы ответа files.list.
 * @param client - клиент Google
 * @param query - условие поиска Drive API
 * @param fields - нужные поля файлов
 */
async function listFiles(client: GoogleClient, query: string, fields: string): Promise<DriveFile[]> {
  const files: DriveFile[] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({ q: query, fields: `nextPageToken,files(${fields})`, pageSize: '1000' });
    if (pageToken) params.set('pageToken', pageToken);
    const page = await client.json<{ files: DriveFile[]; nextPageToken?: string }>(`https://www.googleapis.com/drive/v3/files?${params}`);
    files.push(...page.files);
    pageToken = page.nextPageToken;
  } while (pageToken);
  return files;
}

/** Фото товара на Диске. */
export interface DrivePhoto {
  id: string;
  /** Артикул: название папки, в которой лежит фото */
  productId: string;
  name: string;
  /** Контрольная сумма содержимого: по ней фото кэшируется и получает имя на сайте */
  md5: string;
}

/**
 * Перечисляет фото товаров: папки внутри корневой названы артикулами, порядок фото — по имени файла.
 * @param client - клиент Google
 * @param rootFolderId - ID корневой папки с фото
 */
export async function listPhotos(client: GoogleClient, rootFolderId: string): Promise<DrivePhoto[]> {
  const folders = await listFiles(client, `'${rootFolderId}' in parents and mimeType = '${FOLDER_MIME}' and trashed = false`, 'id,name');
  const productByFolder = new Map(folders.map((folder) => [folder.id, folder.name.trim()]));
  // Сервисный аккаунт видит только то, чем с ним поделились, поэтому ищем по всем картинкам и отбираем по папке
  const images = await listFiles(client, `mimeType contains 'image/' and trashed = false`, 'id,name,md5Checksum,parents');

  return images
    .flatMap((file) => {
      const productId = productByFolder.get(file.parents?.[0] ?? '');
      return productId && file.md5Checksum ? [{ id: file.id, productId, name: file.name, md5: file.md5Checksum }] : [];
    })
    .sort((a, b) => a.productId.localeCompare(b.productId) || a.name.localeCompare(b.name, 'ru', { numeric: true }));
}

/**
 * Скачивает содержимое файла с Диска.
 * @param client - клиент Google
 * @param fileId - ID файла
 */
export function downloadFile(client: GoogleClient, fileId: string): Promise<Buffer> {
  return client.buffer(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`);
}

/**
 * Время последнего изменения файла на Диске (для таблицы — любой правки).
 * @param client - клиент Google
 * @param fileId - ID файла
 */
export async function getModifiedTime(client: GoogleClient, fileId: string): Promise<string> {
  return (await client.json<{ modifiedTime: string }>(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=modifiedTime`)).modifiedTime;
}
