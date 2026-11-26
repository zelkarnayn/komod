import { Link, useParams } from 'react-router-dom';
import { useSolution } from '@/entities/solution';
import { ROUTES } from '@/shared/config';
import { Container, PageMeta } from '@/shared/ui';
import { SolutionDetails } from '@/widgets/solution-details';
import styles from './solution-page.module.css';

/** Страница одного готового решения: /solutions/:solutionId */
export function SolutionPage() {
  const { solutionId } = useParams();
  const { data: solution, isPending } = useSolution(solutionId);

  if (isPending) {
    return (
      <Container className={styles.state}>
        <PageMeta />
        Загружаем решение…
      </Container>
    );
  }

  if (!solution) {
    return (
      <Container className={styles.state}>
        <PageMeta title="Решение не найдено" />
        <h1>Такого решения нет</h1>
        <p>
          Возможно, ссылка устарела. <Link to={ROUTES.solutions}>Посмотреть все решения</Link>
        </p>
      </Container>
    );
  }

  return (
    <Container className={styles.top}>
      <PageMeta title={`${solution.name} — готовое решение`} description={solution.description} />
      <Link to={ROUTES.solutions} className={styles.back}>
        Все решения
      </Link>
      <SolutionDetails solution={solution} />
    </Container>
  );
}
