/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** mock — тестовые данные из кода, sheets — Google Sheets; по умолчанию mock */
  readonly VITE_DATA_SOURCE?: string;
  /** Опубликованный CSV листа «Товары» */
  readonly VITE_PRODUCTS_CSV_URL?: string;
  /** Опубликованный CSV листа «Комплекты» */
  readonly VITE_SOLUTIONS_CSV_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
