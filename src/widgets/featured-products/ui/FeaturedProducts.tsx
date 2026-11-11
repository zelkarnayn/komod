import { Link } from 'react-router-dom';
import { ProductGrid, useProducts } from '@/entities/product';
import { ROUTES } from '@/shared/config';
import { Section, SectionHeading, buttonClassName } from '@/shared/ui';
import styles from './featured-products.module.css';

const FEATURED_COUNT = 4;

/** Подборка товаров на главной. */
export function FeaturedProducts() {
  const { data, isPending } = useProducts();

  return (
    <Section tone="deep">
      <SectionHeading title="Из каталога" lead="Несколько вещей, с которых удобно начать. Остальное в каталоге." />
      {isPending || !data ? <p className={styles.state}>Загружаем каталог…</p> : <ProductGrid products={data.slice(0, FEATURED_COUNT)} />}
      <div className={styles.more}>
        <Link to={ROUTES.catalog} className={buttonClassName('outline')}>
          Весь каталог
        </Link>
      </div>
    </Section>
  );
}
