import { useState } from 'react';
import { ROOM_LABELS, STYLE_LABELS, formatDimensions, getAvailabilityText } from '@/entities/product';
import type { Product } from '@/entities/product';
import { AskAboutProductButton } from '@/features/ask-in-whatsapp';
import { formatPrice } from '@/shared/lib';
import styles from './product-details.module.css';

interface ProductDetailsProps {
  product: Product;
}

/** Страница товара: галерея, цена, наличие, характеристики и кнопка WhatsApp. */
export function ProductDetails({ product }: ProductDetailsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = product.images[activeIndex] ?? product.images[0];

  // Характеристики показываем только те, что известны: пустое не выводим
  const specs: [label: string, value: string | null][] = [
    ['Комната', ROOM_LABELS[product.room]],
    ['Стиль', STYLE_LABELS[product.style]],
    ['Цвет', product.color || null],
    ['Материал', product.material || null],
    ['Размеры', formatDimensions(product.dimensions)],
    ['Артикул', product.id],
  ];

  return (
    <div className={styles.layout}>
      <div className={styles.gallery}>
        <div className={styles.main}>
          <img className={styles.mainImage} src={activeImage} alt={product.name} />
        </div>
        {product.images.length > 1 ? (
          <div className={styles.thumbs}>
            {product.images.map((src, index) => (
              <button
                key={src}
                type="button"
                aria-label={`Фото ${index + 1}`}
                aria-pressed={index === activeIndex}
                className={index === activeIndex ? `${styles.thumb} ${styles.thumbActive}` : styles.thumb}
                onClick={() => setActiveIndex(index)}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <p className={styles.kind}>{product.kind}</p>
        <h1 className={styles.title}>{product.name}</h1>
        <p className={styles.price}>{formatPrice(product.price) ?? 'Цена по запросу'}</p>
        <p className={styles.availability}>{getAvailabilityText(product)}</p>
        <p className={styles.description}>{product.description}</p>
        <dl className={styles.specs}>
          {specs.map(([label, value]) =>
            value ? (
              <div key={label} style={{ display: 'contents' }}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ) : null,
          )}
        </dl>
        <AskAboutProductButton product={product} />
      </div>
    </div>
  );
}
