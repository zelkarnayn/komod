import { Link, useParams } from 'react-router-dom';
import { useSolution } from '@/entities/solution';
import { ROUTES } from '@/shared/config';
import { usePageTitle } from '@/shared/lib';
import { Container } from '@/shared/ui';
import { SolutionDetails } from '@/widgets/solution-details';
import styles from './solution-page.module.css';

/** Страница одного готового решения: /solutions/:solutionId */
export function SolutionPage() {
  const { solutionId } = useParams();
  const { data: solution, isPending } = useSolution(solutionId);
  usePageTitle(solution ? `${solution.name} — готовое решение` : isPending ? undefined : 'Решение не найдено');

  if (isPending) {
    return <Container className={styles.state}>Загружаем решение…</Container>;
  }

  if (!solution) {
    return (
      <Container className={styles.state}>
        <h1>Такого решения нет</h1>
        <p>
          Возможно, ссылка устарела. <Link to={ROUTES.solutions}>Посмотреть все решения</Link>
        </p>
      </Container>
    );
  }

  return (
    <Container className={styles.top}>
      <Link to={ROUTES.solutions} className={styles.back}>
        Все решения
      </Link>
      <SolutionDetails solution={solution} />
    </Container>
  );
}
