import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchSolutions } from './solutions.api';

/** Запрос всех готовых решений; через него они заранее загружаются перед отрисовкой. */
export const solutionsQuery = queryOptions({ queryKey: ['solutions'], queryFn: fetchSolutions });

/** Все готовые решения. */
export function useSolutions() {
  return useQuery(solutionsQuery);
}

/** Одно решение по артикулу; `data` будет undefined, если такого нет. */
export function useSolution(id: string | undefined) {
  return useQuery({ ...solutionsQuery, select: (items) => items.find((item) => item.id === id) });
}
