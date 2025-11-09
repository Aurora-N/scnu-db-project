import { createBrowserRouter } from 'react-router';
import HomePage from '@/pages/HomePage';
import MyCartPage from '@/pages/MyCartPage';
import OrdersPage from '@/pages/OrdersPage';
import ProductInfoPage from '@/pages/ProductInfoPage';
import OrderInfoPage from '@/pages/OrderInfoPage';
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
      {
        path: '/order/:id',
        Component: OrderInfoPage,
      },
    ],
  },
]);

export default router;
