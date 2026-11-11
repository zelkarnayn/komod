import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from './products.api';

const PRODUCTS_KEY = ['products'] as const;

/** Весь каталог. */
export function useProducts() {
  return useQuery({ queryKey: PRODUCTS_KEY, queryFn: fetchProducts });
}

/** Один товар по артикулу; `data` будет undefined, если такого товара нет. */
export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: fetchProducts,
    select: (items) => items.find((item) => item.id === id),
  });
}
