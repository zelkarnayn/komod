import type { ReactNode } from 'react';
import { Container } from '../container/Container';
import styles from './section.module.css';

interface SectionProps {
  id?: string;
  tone?: 'default' | 'deep' | 'dark';
  children: ReactNode;
}

/** Блок страницы с вертикальными отступами и фоном нужного оттенка. */
export function Section({ id, tone = 'default', children }: SectionProps) {
  const toneClass = tone === 'default' ? '' : ` ${styles[tone]}`;
  return (
    <section id={id} className={`${styles.section}${toneClass}`}>
      <Container>{children}</Container>
    </section>
  );
}

interface SectionHeadingProps {
  title: string;
  lead?: string;
}

/** Заголовок блока с необязательным пояснением. */
export function SectionHeading({ title, lead }: SectionHeadingProps) {
  return (
    <div className={styles.heading}>
      <h2 className={styles.title}>{title}</h2>
      {lead ? <p className={styles.lead}>{lead}</p> : null}
    </div>
  );
}
