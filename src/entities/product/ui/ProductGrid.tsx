import type { Product } from '../model/types';
import { ProductCard } from './ProductCard';
import styles from './product-grid.module.css';

interface ProductGridProps {
  products: readonly Product[];
}

/** Адаптивная сетка карточек товаров. */
export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
