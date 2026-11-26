import type { RouteObject } from 'react-router-dom';
import { CatalogPage } from '@/pages/catalog';
import { HomePage } from '@/pages/home';
import { NotFoundPage } from '@/pages/not-found';
import { ProductPage } from '@/pages/product';
import { SolutionPage } from '@/pages/solution';
import { SolutionsPage } from '@/pages/solutions';
import { RootLayout } from './layouts/RootLayout';

/** Маршруты сайта: общие для браузера и для пререндера при сборке. */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'catalog', element: <CatalogPage /> },
      { path: 'catalog/:productId', element: <ProductPage /> },
      { path: 'solutions', element: <SolutionsPage /> },
      { path: 'solutions/:solutionId', element: <SolutionPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
