import { QueryClient } from '@tanstack/react-query';
import { productsQuery } from '@/entities/product';
import { solutionsQuery } from '@/entities/solution';

/**
 * Создаёт кэш запросов и заранее кладёт в него каталог и готовые решения.
 * Данные встроены в сайт при сборке и не меняются до следующей сборки, поэтому
 * перезапрашивать их незачем. Заранее загруженные данные нужны, чтобы первая отрисовка
 * в браузере совпала с готовым HTML, а не показывала «Загружаем…».
 */
export async function createCatalogClient(): Promise<QueryClient> {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, refetchOnWindowFocus: false } },
  });
  await Promise.all([queryClient.prefetchQuery(productsQuery), queryClient.prefetchQuery(solutionsQuery)]);
  return queryClient;
}
