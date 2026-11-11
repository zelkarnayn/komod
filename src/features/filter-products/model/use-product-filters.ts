import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parseFilters } from './filters';
import type { ProductFilters } from './filters';

/** Фильтры каталога, которые хранятся в адресной строке: ссылкой на подборку можно поделиться. */
export function useProductFilters() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(params), [params]);

  /** Включает фильтр; повторный выбор того же значения снимает его. */
  const toggleFilter = useCallback(
    <K extends keyof ProductFilters>(key: K, value: NonNullable<ProductFilters[K]>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (next.get(key) === value) next.delete(key);
          else next.set(key, value);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const resetFilters = useCallback(() => setParams({}, { replace: true }), [setParams]);

  return { filters, toggleFilter, resetFilters };
}
