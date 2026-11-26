import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/config';
import { Container, PageMeta, buttonClassName } from '@/shared/ui';

/** Страница для несуществующих адресов. */
export function NotFoundPage() {
  return (
    <Container style={{ padding: '96px 0' }}>
      <PageMeta title="Страница не найдена" />
      <h1>Страница не найдена</h1>
      <p>Проверьте адрес или начните с главной.</p>
      <Link to={ROUTES.home} className={buttonClassName('primary')}>
        На главную
      </Link>
    </Container>
  );
}
