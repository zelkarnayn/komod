import { AVAILABILITY_LABELS, ROOMS, ROOM_LABELS, STYLES, STYLE_LABELS } from '@/entities/product';
import type { Availability } from '@/entities/product';
import { hasActiveFilters } from '../model/filters';
import type { ProductFilters } from '../model/filters';
import styles from './product-filters.module.css';

/** «Нет в наличии» в фильтре не нужен, поэтому список наличия сокращён вручную. */
const AVAILABILITY_OPTIONS: readonly Availability[] = ['showroom', 'in-stock', 'on-order'];

interface ChipGroupProps<T extends string> {
  label: string;
  options: readonly T[];
  labels: Record<T, string>;
  value: T | null;
  onToggle: (value: T) => void;
}

function ChipGroup<T extends string>({ label, options, labels, value, onToggle }: ChipGroupProps<T>) {
  return (
    <div className={styles.group} role="group" aria-label={label}>
      <span className={styles.groupLabel}>{label}</span>
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            className={active ? `${styles.chip} ${styles.chipActive}` : styles.chip}
            onClick={() => onToggle(option)}
          >
            {labels[option]}
          </button>
        );
      })}
    </div>
  );
}

interface ProductFiltersPanelProps {
  filters: ProductFilters;
  onToggle: <K extends keyof ProductFilters>(key: K, value: NonNullable<ProductFilters[K]>) => void;
  onReset: () => void;
}

/** Панель фильтров каталога: комната, стиль, наличие. */
export function ProductFiltersPanel({ filters, onToggle, onReset }: ProductFiltersPanelProps) {
  return (
    <div className={styles.panel}>
      <ChipGroup label="Комната" options={ROOMS} labels={ROOM_LABELS} value={filters.room} onToggle={(v) => onToggle('room', v)} />
      <ChipGroup label="Стиль" options={STYLES} labels={STYLE_LABELS} value={filters.style} onToggle={(v) => onToggle('style', v)} />
      <ChipGroup
        label="Наличие"
        options={AVAILABILITY_OPTIONS}
        labels={AVAILABILITY_LABELS}
        value={filters.availability}
        onToggle={(v) => onToggle('availability', v)}
      />
      {hasActiveFilters(filters) ? (
        <button type="button" className={styles.reset} onClick={onReset}>
          Сбросить фильтры
        </button>
      ) : null}
    </div>
  );
}
