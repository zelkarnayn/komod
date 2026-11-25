import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/config';
import { usePageTitle } from '@/shared/lib';
import { Container, buttonClassName } from '@/shared/ui';

/** Страница для несуществующих адресов. */
export function NotFoundPage() {
  usePageTitle('Страница не найдена');
  return (
    <Container style={{ padding: '96px 0' }}>
      <h1>Страница не найдена</h1>
      <p>Проверьте адрес или начните с главной.</p>
      <Link to={ROUTES.home} className={buttonClassName('primary')}>
        На главную
      </Link>
    </Container>
  );
}
