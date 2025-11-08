import { createBrowserRouter } from 'react-router';
import HomePage from '@/pages/HomePage';
import MyCartPage from '@/pages/MyCartPage';
import OrdersPage from '@/pages/OrdersPage';
import ProductInfoPage from '@/pages/ProductInfoPage';
import App from '../App';

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: '/',
        Component: HomePage,
      },
      {
        path: '/cart',
        Component: MyCartPage,
      },
      {
        path: '/orders',
        Component: OrdersPage,
      },
      {
        path: '/product/:id',
        Component: ProductInfoPage,
      },
    ],
  },
]);

export default router;
