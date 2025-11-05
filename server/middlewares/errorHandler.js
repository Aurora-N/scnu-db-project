// 错误处理中间件
export default function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ _error: 'Internal Server error' });
};
