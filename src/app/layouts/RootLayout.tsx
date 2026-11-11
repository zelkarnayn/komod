import { Outlet } from 'react-router-dom';
import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header';
import { ScrollManager } from './ScrollManager';

/** Общая обёртка страниц: шапка, содержимое, подвал. */
export function RootLayout() {
  return (
    <>
      <ScrollManager />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
