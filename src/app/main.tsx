import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { createCatalogClient } from './query-client';
import { routes } from './routes';
import './styles/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Не найден элемент #root в index.html');

const queryClient = await createCatalogClient();
const app = (
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={createBrowserRouter(routes)} />
    </QueryClientProvider>
  </StrictMode>
);

// Готовый HTML страницы оживляем (гидрация). Рисуем заново, если HTML не совпадёт с адресом:
// при разработке (HTML пустой), на 404.html (её отдают на любой неизвестный адрес)
// и с фильтрами в адресе (пререндер собран без них)
if (rootElement.hasAttribute('data-prerendered') && !window.location.search) {
  hydrateRoot(rootElement, app);
} else {
  // Убираем содержимое и заголовок готового HTML: иначе рядом с новыми окажутся старые
  rootElement.replaceChildren();
  for (const tag of document.head.querySelectorAll('title, meta[name="description"]')) tag.remove();
  createRoot(rootElement).render(app);
}
