import { Container, PageMeta } from '@/shared/ui';
import { SolutionsList } from '@/widgets/solutions-list';
import styles from './solutions-page.module.css';

/** Страница со всеми готовыми решениями. */
export function SolutionsPage() {
  return (
    <Container className={styles.top}>
      <PageMeta
        title="Готовые решения"
        description="Готовые интерьерные решения салона «Комод»: мебель и декор, подобранные друг к другу по стилю, цвету и размеру."
      />
      <h1 className={styles.title}>Готовые решения</h1>
      <p className={styles.lead}>Комплекты, в которых мебель и декор уже подобраны друг к другу по стилю, цвету и размеру.</p>
      <SolutionsList />
    </Container>
  );
}
