import type { Plugin } from 'vite';

/** Имя модуля, через который сайт получает CSV листов таблицы. */
const MODULE_ID = 'virtual:komod-catalog';
const RESOLVED_ID = `\0${MODULE_ID}`;

interface CatalogCsv {
  productsCsv: string;
  solutionsCsv: string;
}

/**
 * Скачанная таблица на всё время процесса. Клиентская и серверная сборки идут в одном процессе
 * и обязаны получить одинаковые данные: иначе готовый HTML разойдётся с тем, что нарисует браузер.
 */
let buildCatalog: Promise<CatalogCsv> | undefined;

/**
 * Скачивает опубликованный CSV листа.
 * @param url - адрес «Опубликовать в интернете → CSV»
 * @throws {Error} если таблица недоступна: сборка останавливается, а на хостинге остаётся прошлая версия сайта
 */
async function downloadCsv(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Не удалось скачать таблицу (${url}): HTTP ${response.status}`);
  return response.text();
}

/**
 * Скачивает оба листа таблицы.
 * @param env - переменные окружения Vite с адресами CSV
 */
async function downloadCatalog(env: Record<string, string>): Promise<CatalogCsv> {
  const [productsCsv, solutionsCsv] = await Promise.all([
    downloadCsv(env.VITE_PRODUCTS_CSV_URL ?? ''),
    downloadCsv(env.VITE_SOLUTIONS_CSV_URL ?? ''),
  ]);
  return { productsCsv, solutionsCsv };
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
      '  Для боевой сборки задайте VITE_DATA_SOURCE=sheets и адреса CSV (см. .env.example).\x1b[0m',
      '',
    ].join('\n'),
  );
}

/**
 * Источник данных каталога.
 * Проверяет VITE_DATA_SOURCE и адреса CSV, а в режиме sheets скачивает таблицу и встраивает её
 * в сайт модулем `virtual:komod-catalog`. Посетители сайта к Google не обращаются: таблицу
 * читает только сборка. В режиме разработки таблица скачивается заново при каждом обновлении страницы.
 */
export function catalogSource(): Plugin {
  let isSheets = false;
  let isMockBuild = false;
  let isDev = false;
  let env: Record<string, string> = {};

  return {
    name: 'komod:catalog-source',

    configResolved(config) {
      const source = config.env.VITE_DATA_SOURCE || 'mock';
      if (source !== 'mock' && source !== 'sheets') {
        throw new Error(`VITE_DATA_SOURCE=${source}: допустимы только mock и sheets`);
      }
      if (source === 'sheets') {
        const missing = ['VITE_PRODUCTS_CSV_URL', 'VITE_SOLUTIONS_CSV_URL'].filter((name) => !config.env[name]);
        if (missing.length > 0) throw new Error(`VITE_DATA_SOURCE=sheets, но не заданы ${missing.join(', ')}`);
      }
      isSheets = source === 'sheets';
      isDev = config.command === 'serve';
      env = config.env;
      // Предупреждаем один раз, в клиентской сборке
      isMockBuild = !isDev && !isSheets && config.build.ssr === false;
      if (isMockBuild) warnMock((message) => config.logger.warn(message));
    },

    configureServer(server) {
      // Перед каждой загрузкой страницы сбрасываем модуль, чтобы таблица скачалась заново
      server.middlewares.use((req, _res, next) => {
        if (req.headers.accept?.includes('text/html')) {
          for (const environment of Object.values(server.environments)) {
            const module = environment.moduleGraph.getModuleById(RESOLVED_ID);
            if (module) environment.moduleGraph.invalidateModule(module);
          }
        }
        next();
      });
    },

    resolveId(id) {
      return id === MODULE_ID ? RESOLVED_ID : undefined;
    },

    async load(id) {
      if (id !== RESOLVED_ID) return undefined;
      let catalog: CatalogCsv = { productsCsv: '', solutionsCsv: '' };
      if (isSheets) {
        catalog = isDev ? await downloadCatalog(env) : await (buildCatalog ??= downloadCatalog(env));
      }
      return Object.entries(catalog)
        .map(([name, value]) => `export const ${name} = ${JSON.stringify(value)};`)
        .join('\n');
    },

    // Повторяем в конце, чтобы предупреждение не утонуло в выводе сборки
    closeBundle() {
      if (isMockBuild) warnMock((message) => this.warn(message));
    },
  };
}
