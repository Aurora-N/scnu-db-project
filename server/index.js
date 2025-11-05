import express from "express";
import responseHandler from "./middlewares/responseHandler.js";
import usersRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();
app.use(express.json());
app.use(responseHandler);
app.use(usersRoutes);
app.use(authRoutes);
app.use(errorHandler);

// 启动服务
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
