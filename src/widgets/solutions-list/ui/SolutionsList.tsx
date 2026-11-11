import { Link } from 'react-router-dom';
import { ROOM_LABELS, STYLE_LABELS, useProducts } from '@/entities/product';
import { resolveSolution, useSolutions } from '@/entities/solution';
import type { Solution } from '@/entities/solution';
import type { Product } from '@/entities/product';
import { ROUTES } from '@/shared/config';
import { formatPrice, pluralizeRu } from '@/shared/lib';
import styles from './solutions-list.module.css';

interface SolutionCardProps {
  solution: Solution;
  products: readonly Product[];
}

function SolutionCard({ solution, products }: SolutionCardProps) {
  const { items, price, saving, cover } = resolveSolution(solution, products);
  const kinds = items.map((item) => item.kind.toLowerCase()).join(', ');

  return (
    <Link to={ROUTES.solution(solution.id)} className={styles.card}>
      <div className={styles.cover}>{cover ? <img className={styles.coverImage} src={cover} alt={solution.name} loading="lazy" /> : null}</div>
      <div className={styles.body}>
        <h3 className={styles.name}>{solution.name}</h3>
        <p className={styles.meta}>
          {ROOM_LABELS[solution.room]}, {STYLE_LABELS[solution.style]}
        </p>
        <p className={styles.items}>
          {items.length} {pluralizeRu(items.length, ['предмет', 'предмета', 'предметов'])}: {kinds}
        </p>
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(price) ?? 'Цена по запросу'}</span>
          {saving !== null ? <span className={styles.saving}>выгода {formatPrice(saving)}</span> : null}
        </div>
      </div>
    </Link>
  );
}

interface SolutionsListProps {
  /** Сколько решений показать; по умолчанию все */
  limit?: number;
}

/** Сетка готовых решений. */
export function SolutionsList({ limit }: SolutionsListProps) {
  const { data: solutions, isPending: solutionsPending } = useSolutions();
  const { data: products, isPending: productsPending } = useProducts();

  if (solutionsPending || productsPending || !solutions || !products) {
    return <p className={styles.state}>Загружаем готовые решения…</p>;
  }

  const visible = limit === undefined ? solutions : solutions.slice(0, limit);

  return (
    <div className={styles.grid}>
      {visible.map((solution) => (
        <SolutionCard key={solution.id} solution={solution} products={products} />
      ))}
    </div>
  );
}
