import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadEnv } from 'vite';
import type { Plugin } from 'vite';
import { SHEET_COLUMNS } from '../src/shared/config/sheet-columns.ts';
import { pickColumns } from './pick-columns.ts';
import { GOOGLE_ENV, connectGoogle, listPhotos, readGoogleConfig, readSheetRows } from './google.ts';
import type { GoogleConfig } from './google.ts';
import { preparePhotos } from './photos.ts';

/** Имя модуля, через который сайт получает таблицу и фото. */
const MODULE_ID = 'virtual:komod-catalog';
const RESOLVED_ID = `\0${MODULE_ID}`;
/** Кэш готовых фото между сборками; на GitHub Actions сохраняется через actions/cache */
const PHOTO_CACHE_DIR = '.cache/photos';

interface Catalog {
  /** Строки листа «Товары», первая — заголовки */
  productsRows: string[][];
  /** Строки листа «Комплекты», первая — заголовки */
  solutionsRows: string[][];
  /** Адреса фото по артикулу */
  photos: Record<string, string[]>;
  /** Файлы фото для сайта: адрес без «/» → путь в кэше */
  photoFiles: Map<string, string>;
}

const EMPTY_CATALOG: Catalog = { productsRows: [], solutionsRows: [], photos: {}, photoFiles: new Map() };

/**
 * Скачанный каталог на всё время процесса. Клиентская и серверная сборки идут в одном процессе
 * и обязаны получить одинаковые данные: иначе готовый HTML разойдётся с тем, что нарисует браузер.
 */
let buildCatalog: Promise<Catalog> | undefined;

/**
 * Скачивает оба листа таблицы и готовит фото с Диска.
 * Ошибка доступа останавливает сборку, а на хостинге остаётся прошлая версия сайта.
 * @param config - настройки Google
 * @param root - корень проекта
 * @param warn - куда писать предупреждения
 */
async function downloadCatalog(config: GoogleConfig, root: string, warn: (message: string) => void): Promise<Catalog> {
  const client = await connectGoogle(config.serviceAccountKey);
  const [productsRows, solutionsRows, drivePhotos] = await Promise.all([
    readSheetRows(client, config.sheetId, SHEET_COLUMNS.products.sheet),
    readSheetRows(client, config.sheetId, SHEET_COLUMNS.solutions.sheet),
    listPhotos(client, config.photosFolderId),
  ]);
  const { byProduct, files } = await preparePhotos(client, drivePhotos, join(root, PHOTO_CACHE_DIR), warn);
  return {
    productsRows: pickColumns(productsRows, SHEET_COLUMNS.products),
    solutionsRows: pickColumns(solutionsRows, SHEET_COLUMNS.solutions),
    photos: byProduct,
    photoFiles: files,
  };
}

/**
 * Печатает заметное предупреждение о сборке на тестовых данных.
 * @param log - куда писать
 */
function warnMock(log: (message: string) => void): void {
  log(
    [
      '',
      '\x1b[43m\x1b[30m ВНИМАНИЕ: СБОРКА НА ТЕСТОВЫХ ДАННЫХ (VITE_DATA_SOURCE=mock) \x1b[0m',
      '\x1b[33m  На сайте будут придуманные товары и цены.',
      `  Для боевой сборки задайте VITE_DATA_SOURCE=sheets и ${Object.values(GOOGLE_ENV).join(', ')} (см. .env.example).\x1b[0m`,
      '',
    ].join('\n'),
  );
}

/**
 * Источник данных каталога.
 * Проверяет VITE_DATA_SOURCE и настройки Google, а в режиме sheets читает таблицу и фото
 * от имени сервисного аккаунта и встраивает их в сайт модулем `virtual:komod-catalog`.
 * Фото пережимаются в WebP и кладутся в папку сайта. Посетители сайта к Google не обращаются.
 * В режиме разработки таблица и фото читаются заново при каждом обновлении страницы.
 */
export function catalogSource(): Plugin {
  let google: GoogleConfig | undefined;
  let isMockBuild = false;
  let isDev = false;
  let root = '';
  /** Последний прочитанный каталог при разработке: из него отдаются фото */
  let devCatalog: Catalog = EMPTY_CATALOG;

  return {
    name: 'komod:catalog-source',

    configResolved(config) {
      // Тесты (vitest) всегда идут на тестовых данных и не обращаются к Google
      const source = process.env.VITEST ? 'mock' : config.env.VITE_DATA_SOURCE || 'mock';
      if (source !== 'mock' && source !== 'sheets') {
        throw new Error(`VITE_DATA_SOURCE=${source}: допустимы только mock и sheets`);
      }
      // Ключ доступа берём из окружения напрямую: в сайт попадают только переменные VITE_
      if (source === 'sheets') google = readGoogleConfig({ ...loadEnv(config.mode, config.envDir || config.root, 'GOOGLE_'), ...process.env });
      isDev = config.command === 'serve';
      root = config.root;
      // Предупреждаем один раз, в клиентской сборке
      isMockBuild = !isDev && !google && config.build.ssr === false;
      if (isMockBuild) warnMock((message) => config.logger.warn(message));
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Перед каждой загрузкой страницы сбрасываем модуль, чтобы таблица и фото прочитались заново
        if (req.headers.accept?.includes('text/html')) {
          for (const environment of Object.values(server.environments)) {
            const module = environment.moduleGraph.getModuleById(RESOLVED_ID);
            if (module) environment.moduleGraph.invalidateModule(module);
          }
        }
        const photoPath = devCatalog.photoFiles.get(decodeURIComponent(req.url?.split('?')[0] ?? '').slice(1));
        if (!photoPath) {
          next();
          return;
        }
        readFile(photoPath).then(
          (data) => res.setHeader('content-type', 'image/webp').end(data),
          (error: unknown) => next(error),
        );
      });
    },

    resolveId(id) {
      return id === MODULE_ID ? RESOLVED_ID : undefined;
    },

    async load(id) {
      if (id !== RESOLVED_ID) return undefined;
      let catalog = EMPTY_CATALOG;
      if (google) {
        const warn = (message: string) => this.warn(message);
        catalog = isDev ? (devCatalog = await downloadCatalog(google, root, warn)) : await (buildCatalog ??= downloadCatalog(google, root, warn));
      }
      const { productsRows, solutionsRows, photos } = catalog;
      return Object.entries({ productsRows, solutionsRows, photos })
        .map(([name, value]) => `export const ${name} = ${JSON.stringify(value)};`)
        .join('\n');
    },

    // Фото кладём в клиентскую сборку: серверная после пререндера удаляется
    async generateBundle() {
      if (!buildCatalog || this.environment.name !== 'client') return;
      for (const [fileName, path] of (await buildCatalog).photoFiles) {
        this.emitFile({ type: 'asset', fileName, source: await readFile(path) });
      }
    },

    // Повторяем в конце, чтобы предупреждение не утонуло в выводе сборки
    closeBundle() {
      if (isMockBuild) warnMock((message) => this.warn(message));
    },
  };
}
