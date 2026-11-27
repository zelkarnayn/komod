/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** mock — тестовые данные из кода, sheets — Google Sheets; по умолчанию mock */
  readonly VITE_DATA_SOURCE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Таблица и фото, прочитанные при сборке (build/catalog-source.ts); в режиме mock — пустые. */
declare module 'virtual:komod-catalog' {
  /** Строки листа «Товары», первая — заголовки */
  export const productsRows: string[][];
  /** Строки листа «Комплекты», первая — заголовки */
  export const solutionsRows: string[][];
  /** Адреса фото с Google Диска по артикулу, первое — главное */
  export const photos: Record<string, string[]>;
}
