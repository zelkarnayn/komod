import { SITE } from '@/shared/config';
import { Container } from '@/shared/ui';
import styles from './footer.module.css';

/** Подвал сайта. */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container className={styles.row}>
        <span>
          © {SITE.name}, {SITE.city}
        </span>
        <span>{SITE.workHours}</span>
      </Container>
    </footer>
  );
}
