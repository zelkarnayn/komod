/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** mock — тестовые данные из кода, sheets — Google Sheets; по умолчанию mock */
  readonly VITE_DATA_SOURCE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** CSV листов таблицы, скачанные при сборке (build/catalog-source.ts); в режиме mock — пустые строки. */
declare module 'virtual:komod-catalog' {
  export const productsCsv: string;
  export const solutionsCsv: string;
}
