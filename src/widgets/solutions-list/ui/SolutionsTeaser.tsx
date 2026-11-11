import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/config';
import { Section, SectionHeading, buttonClassName } from '@/shared/ui';
import { SolutionsList } from './SolutionsList';
import styles from './solutions-list.module.css';

const TEASER_COUNT = 3;

/** Блок «Готовые решения» для главной: несколько комплектов и ссылка на все. */
export function SolutionsTeaser() {
  return (
    <Section tone="dark">
      <SectionHeading title="Готовые решения" lead="Если сложно представить комнату по отдельным вещам, начните с комплекта: всё в нём уже подобрано друг к другу." />
      <SolutionsList limit={TEASER_COUNT} />
      <div className={styles.more}>
        <Link to={ROUTES.solutions} className={buttonClassName('outline')} style={{ color: '#F2EFE6', borderColor: '#F2EFE6' }}>
          Все решения
        </Link>
      </div>
    </Section>
  );
}
