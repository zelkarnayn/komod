import { createBrowserRouter } from 'react-router-dom';
import { CatalogPage } from '@/pages/catalog';
import { HomePage } from '@/pages/home';
import { NotFoundPage } from '@/pages/not-found';
import { ProductPage } from '@/pages/product';
import { SolutionPage } from '@/pages/solution';
import { SolutionsPage } from '@/pages/solutions';
import { RootLayout } from './layouts/RootLayout';

export const router = createBrowserRouter([
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
]);
