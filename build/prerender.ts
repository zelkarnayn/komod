import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/** Что отдаёт серверная сборка src/app/entry-server.tsx. */
interface ServerEntry {
  listPaths(): Promise<string[]>;
  render(path: string): Promise<string>;
  notFoundPath: string;
}

interface PrerenderOptions {
  /** Папка клиентской сборки с index.html */
  outDir: string;
  /** Собранный серверный вход */
  serverEntry: string;
  /** Папка серверной сборки: после пререндера она не нужна и удаляется */
  serverOutDir: string;
}

const ROOT_TAG = '<div id="root"></div>';

/** Теги, которые React поднимает в начало строки: <title>, <meta>, <link>. */
const HOISTED_HEAD = /^(?:<title>[^<]*<\/title>|<meta\b[^>]*>|<link\b[^>]*>)+/u;

/**
 * Вставляет отрисованную страницу в шаблон index.html.
 * @param template - index.html клиентской сборки
 * @param rendered - результат renderToString
 * @param hydrate - пометить страницу для гидрации (у 404.html метки нет: её адрес заранее неизвестен)
 */
function fillTemplate(template: string, rendered: string, hydrate: boolean): string {
  const head = HOISTED_HEAD.exec(rendered)?.[0] ?? '';
  const body = rendered.slice(head.length);
  const root = hydrate ? `<div id="root" data-prerendered>${body}</div>` : `<div id="root">${body}</div>`;
  return template.replace('</head>', `${head}</head>`).replace(ROOT_TAG, root);
}

/**
 * Превращает каждую страницу сайта в готовый HTML: dist/catalog/KM-001/index.html и т. д.
 * Поисковики и посетители сразу получают содержимое, а хостинг без сервера отдаёт
 * вложенные адреса без ошибки 404. Неизвестные адреса получают 404.html: сайт внутри неё
 * сам разберёт адрес, поэтому новый товар откроется, даже если страница для него ещё не собрана.
 * @throws {Error} если в шаблоне нет <div id="root"></div>
 */
export async function prerender({ outDir, serverEntry, serverOutDir }: PrerenderOptions): Promise<void> {
  const template = await readFile(join(outDir, 'index.html'), 'utf8');
  if (!template.includes(ROOT_TAG)) throw new Error(`В index.html нет ${ROOT_TAG}`);

  const entry = (await import(pathToFileURL(serverEntry).href)) as ServerEntry;
  const paths = await entry.listPaths();

  for (const path of paths) {
    const dir = join(outDir, ...path.split('/').filter(Boolean));
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'index.html'), fillTemplate(template, await entry.render(path), true));
  }
  await writeFile(join(outDir, '404.html'), fillTemplate(template, await entry.render(entry.notFoundPath), false));

  await rm(serverOutDir, { recursive: true, force: true });
  console.log(`Пререндер: страниц — ${paths.length}, плюс 404.html`);
}
