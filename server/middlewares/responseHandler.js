// 全局 json 响应包装中间件
// 为所有 json 响应统一加上 { status, message, data }

export default function responseHandler(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = (payload) => {
    const isSuccess = res.statusCode >= 200 && res.statusCode < 300;

    if (isSuccess) {
      const { _message, ...data } = payload;
      return originalJson({
        status: 'success',
        message: typeof _message === 'string' ? _message : 'OK',
        data: Array.isArray(payload) ? payload : data,
      });
    }

    // 错误消息处理
    let errorMessage = '';
    if (payload) {
      if (typeof payload._message === 'string') {
        errorMessage = payload._message;
      } else if (typeof payload._error === 'string') {
        errorMessage = payload._error;
      }
    }

    return originalJson({
      status: 'error',
      message: errorMessage || 'An error occurred',
      data: null,
    });
  };

  next();
}
