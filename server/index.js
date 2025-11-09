import express from 'express';
import responseHandler from './middlewares/responseHandler.js';
import usersRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/product.js';
import categoryRoutes from './routes/category.js';
import orderRoutes from './routes/order.js';
import cartRoutes from './routes/cart.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();
app.use(express.json());
app.use(responseHandler);
app.use(usersRoutes);
app.use(authRoutes);
app.use(productRoutes);
app.use(categoryRoutes);
app.use(orderRoutes);
app.use(cartRoutes);
app.use(errorHandler);

// 启动服务
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
