/** Все маршруты приложения в одном месте, чтобы не разбрасывать строки по коду. */
export const ROUTES = {
  home: '/',
  catalog: '/catalog',
  product: (id: string) => `/catalog/${id}`,
  solutions: '/solutions',
  solution: (id: string) => `/solutions/${id}`,
  /** Якоря блоков главной страницы */
  showroom: '/#showroom',
  services: '/#services',
  contacts: '/#contacts',
} as const;
