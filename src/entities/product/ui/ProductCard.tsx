import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/config';
import { formatPrice } from '@/shared/lib';
import { getAvailabilityText } from '../lib/format';
import { STYLE_LABELS } from '../model/labels';
import type { Product } from '../model/types';
import styles from './product-card.module.css';

interface ProductCardProps {
  product: Product;
}

/** Карточка товара для сеток каталога. Ведёт на страницу товара. */
export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={ROUTES.product(product.id)} className={styles.card}>
      <div className={styles.imageWrap}>
        <img className={styles.image} src={product.images[0]} alt={product.name} loading="lazy" />
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
