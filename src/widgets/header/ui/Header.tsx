import { Link } from 'react-router-dom';
import { WhatsAppButton } from '@/features/ask-in-whatsapp';
import { ROUTES, SITE } from '@/shared/config';
import { Container } from '@/shared/ui';
import styles from './header.module.css';

/** Шапка сайта: логотип, навигация и кнопка WhatsApp. */
export function Header() {
  return (
    <header className={styles.header}>
      <Container className={styles.row}>
        <Link to={ROUTES.home} className={styles.logo}>
          {SITE.name}
        </Link>
        <nav className={styles.nav} aria-label="Основная навигация">
          <Link to={ROUTES.solutions}>Готовые решения</Link>
          <Link to={ROUTES.catalog}>Каталог</Link>
          <Link to={ROUTES.showroom}>Шоурум</Link>
          <Link to={ROUTES.services}>Услуги</Link>
          <Link to={ROUTES.contacts}>Контакты</Link>
        </nav>
        <WhatsAppButton message="Здравствуйте! Хочу подобрать интерьер.">Написать в WhatsApp</WhatsAppButton>
      </Container>
    </header>
  );
}
