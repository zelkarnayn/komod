import type { Product } from '@/entities/product/@x/solution';
import type { Solution } from '../model/types';

/** Решение вместе с найденными товарами и посчитанными ценами. */
export interface ResolvedSolution {
  /** Товары, найденные в каталоге, в порядке состава */
  items: Product[];
  /** Сумма цен товаров; null, если у какого-то товара нет цены или он не найден */
  sum: number | null;
  /** Итоговая цена: цена комплекта, а если её нет, то сумма товаров */
  price: number | null;
  /** Экономия относительно суммы товаров; null, если выгоды нет */
  saving: number | null;
  /** Обложка: своя или фото первого товара */
  cover: string | undefined;
}

/**
 * Собирает решение из каталога: находит товары по артикулам и считает цены.
 * Цену мы не выдумываем: если у товара нет цены или он пропал из каталога,
 * сумма остаётся неизвестной (null), и сайт покажет «цена по запросу».
 * @param solution - решение из таблицы
 * @param products - весь каталог товаров
 */
export function resolveSolution(solution: Solution, products: readonly Product[]): ResolvedSolution {
  const byId = new Map(products.map((product) => [product.id, product]));
  const items = solution.productIds.map((id) => byId.get(id)).filter((item): item is Product => item !== undefined);

  const isComplete = items.length === solution.productIds.length && items.length > 0;
  const prices = items.map((item) => item.price);
  const sum = isComplete && prices.every((price): price is number => price !== null) ? prices.reduce((total, price) => total + price, 0) : null;

  const price = solution.price ?? sum;
  const saving = solution.price !== null && sum !== null && solution.price < sum ? sum - solution.price : null;

  return { items, sum, price, saving, cover: solution.cover ?? items[0]?.images[0] };
}
