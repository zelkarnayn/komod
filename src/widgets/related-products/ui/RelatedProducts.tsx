import { ProductGrid, useProducts } from '@/entities/product';
import type { Product } from '@/entities/product';
import { Section, SectionHeading } from '@/shared/ui';

interface RelatedProductsProps {
  product: Pick<Product, 'id' | 'relatedIds'>;
}

/** «С этим сочетается»: товары, указанные в таблице как подходящие к текущему. */
export function RelatedProducts({ product }: RelatedProductsProps) {
  const { data } = useProducts();
  const related = (data ?? []).filter((item) => item.id !== product.id && product.relatedIds.includes(item.id));

  if (related.length === 0) return null;

  return (
    <Section tone="deep">
      <SectionHeading title="С этим сочетается" lead="Вещи, которые мы подбирали в пару к этому товару." />
      <ProductGrid products={related} />
    </Section>
  );
}
