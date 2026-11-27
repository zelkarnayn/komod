import { ProductGrid, ROOM_LABELS, STYLE_LABELS, useProducts } from '@/entities/product';
import { resolveSolution } from '@/entities/solution';
import type { Solution } from '@/entities/solution';
import { AskAboutSolutionButton } from '@/features/ask-in-whatsapp';
import { formatPrice, photoSources } from '@/shared/lib';
import styles from './solution-details.module.css';

interface SolutionDetailsProps {
  solution: Solution;
}

/** Страница готового решения: обложка, цена комплекта и все товары в составе. */
export function SolutionDetails({ solution }: SolutionDetailsProps) {
  const { data: products } = useProducts();
  const { items, price, sum, saving, cover } = resolveSolution(solution, products ?? []);

  return (
    <div>
      <div className={styles.head}>
        <div className={styles.cover}>{cover ? <img className={styles.coverImage} {...photoSources(cover, '(max-width: 900px) 100vw, 1100px')} alt={solution.name} /> : null}</div>
        <div>
          <p className={styles.meta}>
            {ROOM_LABELS[solution.room]}, {STYLE_LABELS[solution.style]}
          </p>
          <h1 className={styles.title}>{solution.name}</h1>
          <p className={styles.description}>{solution.description}</p>
          <p className={styles.price}>{formatPrice(price) ?? 'Цена по запросу'}</p>
          {saving !== null && sum !== null ? (
            <p className={styles.note}>
              Вместе дешевле на {formatPrice(saving)}: по отдельности {formatPrice(sum)}.
            </p>
          ) : (
            <p className={styles.note}>{sum !== null ? 'Цена комплекта равна сумме товаров.' : 'Цену комплекта уточним в WhatsApp.'}</p>
          )}
          <AskAboutSolutionButton solution={solution} />
        </div>
      </div>

      <h2 className={styles.listTitle}>Что входит</h2>
      <ProductGrid products={items} />
    </div>
  );
}
