import { Link, useParams } from 'react-router-dom';
import { useProduct } from '@/entities/product';
import { ROUTES } from '@/shared/config';
import { Container } from '@/shared/ui';
import { ProductDetails } from '@/widgets/product-details';
import { RelatedProducts } from '@/widgets/related-products';
import styles from './product-page.module.css';

/** Страница одного товара: /catalog/:productId */
export function ProductPage() {
  const { productId } = useParams();
  const { data: product, isPending } = useProduct(productId);

  if (isPending) {
    return <Container className={styles.state}>Загружаем товар…</Container>;
  }

  if (!product) {
    return (
      <Container className={styles.state}>
        <h1>Такого товара нет</h1>
        <p>
          Возможно, он уже продан или ссылка устарела. <Link to={ROUTES.catalog}>Вернуться в каталог</Link>
        </p>
      </Container>
    );
  }

  return (
    <>
      <Container className={styles.top}>
        <Link to={ROUTES.catalog} className={styles.back}>
          Все товары
        </Link>
        <ProductDetails product={product} />
      </Container>
      <RelatedProducts product={product} />
    </>
  );
}
