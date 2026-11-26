import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchProducts } from './products.api';

/** Запрос всего каталога; через него каталог заранее загружается перед отрисовкой. */
export const productsQuery = queryOptions({ queryKey: ['products'], queryFn: fetchProducts });

/** Весь каталог. */
export function useProducts() {
  return useQuery(productsQuery);
}

/** Один товар по артикулу; `data` будет undefined, если такого товара нет. */
export function useProduct(id: string | undefined) {
  return useQuery({ ...productsQuery, select: (items) => items.find((item) => item.id === id) });
}
