import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouterProvider, createStaticHandler, createStaticRouter } from 'react-router-dom';
import { productsQuery } from '@/entities/product';
import { solutionsQuery } from '@/entities/solution';
import { ROUTES } from '@/shared/config';
import { createCatalogClient } from './query-client';
import { routes } from './routes';

/**
 * Вход серверной сборки: им пользуется только пререндер (build/prerender.ts) во время сборки.
 * Каталог загружается один раз на всю сборку, чтобы все страницы получили одинаковые данные.
 */
const catalogClient = createCatalogClient();
const handler = createStaticHandler(routes);

/** Адрес, по которому рисуется 404.html */
export const notFoundPath = '/404/';

/** Адреса всех страниц сайта, включая каждый товар и каждое готовое решение. */
export async function listPaths(): Promise<string[]> {
  const queryClient = await catalogClient;
  const products = queryClient.getQueryData(productsQuery.queryKey) ?? [];
  const solutions = queryClient.getQueryData(solutionsQuery.queryKey) ?? [];
  return [
    ROUTES.home,
    ROUTES.catalog,
    ROUTES.solutions,
    ...products.map((product) => ROUTES.product(product.id)),
    ...solutions.map((solution) => ROUTES.solution(solution.id)),
  ];
}

/**
 * Рисует страницу в HTML-строку.
 * @param path - адрес страницы, например /catalog/KM-001/
 * @throws {Error} если роутер ответил перенаправлением вместо страницы
 */
export async function render(path: string): Promise<string> {
  const context = await handler.query(new Request(new URL(path, 'http://localhost')));
  if (context instanceof Response) throw new Error(`Адрес ${path} вернул перенаправление, а не страницу`);

  return renderToString(
    <StrictMode>
      <QueryClientProvider client={await catalogClient}>
        <StaticRouterProvider router={createStaticRouter(handler.dataRoutes, context)} context={context} hydrate={false} />
      </QueryClientProvider>
    </StrictMode>,
  );
}
