import { ProductGrid, useProducts } from '@/entities/product';
import { WhatsAppButton } from '@/features/ask-in-whatsapp';
import { ProductFiltersPanel, filterProducts, useProductFilters } from '@/features/filter-products';
import { pluralizeRu } from '@/shared/lib';
import styles from './product-catalog.module.css';

/** Каталог: панель фильтров и сетка товаров. Фильтры хранятся в адресной строке. */
export function ProductCatalog() {
  const { data, isPending, isError } = useProducts();
  const { filters, toggleFilter, resetFilters } = useProductFilters();

  if (isPending) return <p className={styles.state}>Загружаем каталог…</p>;
  if (isError) return <p className={styles.state}>Не удалось загрузить каталог. Обновите страницу или напишите нам в WhatsApp.</p>;

  const visible = filterProducts(data, filters);

  return (
    <div>
      <ProductFiltersPanel filters={filters} onToggle={toggleFilter} onReset={resetFilters} />
      {visible.length > 0 ? (
        <>
          <p className={styles.count}>
            Найдено: {visible.length} {pluralizeRu(visible.length, ['товар', 'товара', 'товаров'])}
          </p>
          <ProductGrid products={visible} />
        </>
      ) : (
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>По этим условиям ничего не нашлось</h2>
          <p className={styles.emptyText}>Снимите часть фильтров или расскажите, что ищете: подберём вариант, в том числе под заказ.</p>
          <div className={styles.emptyActions}>
            <WhatsAppButton message="Здравствуйте! Не нашёл(а) в каталоге нужную вещь, помогите подобрать.">Спросить в WhatsApp</WhatsAppButton>
          </div>
        </div>
      )}
    </div>
  );
}
