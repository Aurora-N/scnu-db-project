// 全局 json 响应包装中间件
// 为所有 json 响应统一加上 { status, message, data }

export default function jsonResponse(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = (payload) => {
    const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
    const status = isSuccess ? "success" : "error";

    let message = (res.locals && res.locals.message) || null;
    if (!message && payload && typeof payload === "object") {
      if (typeof payload.message === "string") {
        message = payload.message;
      } else if (typeof payload.error === "string") {
        message = payload.error;
      }
    }

    if (!message) {
      message = isSuccess ? "OK" : "Error";
    }

    return originalJson({ status, message, data: payload });
  };

  next();
}