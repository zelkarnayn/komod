import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/config';
import { formatPrice, photoSources } from '@/shared/lib';
import { getAvailabilityText } from '../lib/format';
import { STYLE_LABELS } from '../model/labels';
import type { Product } from '../model/types';
import styles from './product-card.module.css';

interface ProductCardProps {
  product: Product;
}

/** Карточка товара для сеток каталога. Ведёт на страницу товара. */
export function ProductCard({ product }: ProductCardProps) {
  const cover = product.images[0];
  return (
    <Link to={ROUTES.product(product.id)} className={styles.card}>
      <div className={styles.imageWrap}>
        {cover ? <img className={styles.image} {...photoSources(cover, '(max-width: 700px) 50vw, 400px')} alt={product.name} loading="lazy" /> : null}
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.meta}>
          {product.kind}, {STYLE_LABELS[product.style]}
        </p>
        <div className={styles.footer}>
          <span className={styles.price}>{formatPrice(product.price) ?? 'Цена по запросу'}</span>
          <span className={styles.availability}>{getAvailabilityText(product)}</span>
        </div>
      </div>
    </Link>
  );
}
