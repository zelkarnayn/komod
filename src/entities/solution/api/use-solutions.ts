import { useQuery } from '@tanstack/react-query';
import { fetchSolutions } from './solutions.api';

const SOLUTIONS_KEY = ['solutions'] as const;

/** Все готовые решения. */
export function useSolutions() {
  return useQuery({ queryKey: SOLUTIONS_KEY, queryFn: fetchSolutions });
}

/** Одно решение по артикулу; `data` будет undefined, если такого нет. */
export function useSolution(id: string | undefined) {
  return useQuery({
    queryKey: SOLUTIONS_KEY,
    queryFn: fetchSolutions,
    select: (items) => items.find((item) => item.id === id),
  });
}
