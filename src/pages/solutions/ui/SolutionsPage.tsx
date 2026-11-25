import { Container } from '@/shared/ui';
import { usePageTitle } from '@/shared/lib';
import { SolutionsList } from '@/widgets/solutions-list';
import styles from './solutions-page.module.css';

/** Страница со всеми готовыми решениями. */
export function SolutionsPage() {
  usePageTitle('Готовые решения');
  return (
    <Container className={styles.top}>
      <h1 className={styles.title}>Готовые решения</h1>
      <p className={styles.lead}>Комплекты, в которых мебель и декор уже подобраны друг к другу по стилю, цвету и размеру.</p>
      <SolutionsList />
    </Container>
  );
}
