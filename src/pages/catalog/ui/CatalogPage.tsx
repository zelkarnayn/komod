import { Container } from '@/shared/ui';
import { usePageTitle } from '@/shared/lib';
import { ProductCatalog } from '@/widgets/product-catalog';
import styles from './catalog-page.module.css';

/** Страница каталога. */
export function CatalogPage() {
  usePageTitle('Каталог мебели и декора');
  return (
    <Container className={styles.top}>
      <h1 className={styles.title}>Каталог</h1>
      <ProductCatalog />
    </Container>
  );
}
