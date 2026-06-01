/**
 * 全局错误处理中间件
 * 统一处理所有错误并返回标准化的错误响应
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode, sendError } from '../utils/response';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

/**
 * 错误类型检查接口
 */
interface MongooseError extends Error {
  errors?: Record<string, any>;
  code?: number;
  keyValue?: Record<string, any>;
}

/**
 * 开发环境错误处理器
 */
const sendErrorDev = (err: Error | AppError, res: Response) => {
  const statusCode = (err as AppError).statusCode || 500;
  const errorCode = (err as AppError).errorCode || ErrorCode.INTERNAL_ERROR;
  const details = (err as AppError).details;

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message,
      details,
      stack: err.stack,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * 生产环境错误处理器
 */
const sendErrorProd = (err: Error, res: Response) => {
  if (err instanceof AppError) {
    // 操作性错误：直接返回给客户端
    sendError(res, err.statusCode, err.message, err.errorCode, err.details);
  } else {
    // 编程错误：不泄露错误详情
    logger.error('Unhandled error', err);
    sendError(res, 500, '服务器内部错误', ErrorCode.INTERNAL_ERROR);
  }
};

/**
 * MongoDB错误处理
 */
const handleMongoDBError = (err: MongooseError): AppError => {
  // Mongoose验证错误
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    return AppError.validation('数据验证失败', messages);
  }

  // MongoDB重复键错误
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return AppError.badRequest(`${field}已存在`, { field, value: err.keyValue?.[field] });
  }

  // MongoDB CastError（无效的ObjectId）
  if (err instanceof mongoose.Error.CastError) {
    return AppError.badRequest(`无效的ID格式: ${err.value}`);
  }

  return AppError.internal(err.message);
};

/**
 * JWT错误处理
 */
const handleJWTError = (): AppError => {
  return AppError.unauthorized('Token无效或已过期');
};

/**
 * JWT过期错误处理
 */
const handleJWTExpiredError = (): AppError => {
  return AppError.unauthorized('Token已过期，请重新登录');
};

/**
 * Multer文件上传错误处理
 */
const handleMulterError = (err: any): AppError => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return AppError.badRequest('文件大小超过限制', { maxSize: '5MB' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return AppError.badRequest('上传字段错误');
  }
  if (err.message?.includes('只允许上传')) {
    return AppError.badRequest(err.message, { allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'] });
  }
  return AppError.badRequest(err.message || '文件上传失败');
};

/**
 * 全局错误处理器
 */
export const errorHandler = (
  err: Error | AppError | any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 设置默认值
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // 生成请求ID
  const requestId = req.requestId || 'unknown';

  // 记录错误日志
  logger.error(`[${requestId}] Error occurred`, err, {
    method: req.method,
    url: req.originalUrl,
    body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
    userId: (req as any).user?._id?.toString(),
  });

  // 开发环境返回详细错误
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
    return;
  }

  // 生产环境处理不同类型的错误
  let processedError = err;

  // 处理Mongoose/MongoDB错误
  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    processedError = handleMongoDBError(err);
  }

  // 处理JWT错误
  if (err.name === 'JsonWebTokenError') {
    processedError = handleJWTError();
  }
  if (err.name === 'TokenExpiredError') {
    processedError = handleJWTExpiredError();
  }

  // 处理Multer错误
  if (err.name === 'MulterError' || err.code === 'LIMIT_FILE_SIZE') {
    processedError = handleMulterError(err);
  }

  // 处理AppError
  if (processedError instanceof AppError) {
    sendError(res, processedError.statusCode, processedError.message, processedError.errorCode, processedError.details);
    return;
  }

  // 处理未知错误
  sendErrorProd(err, res);
};

/**
 * 处理404未找到的路由
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = AppError.notFound(`路由 ${req.originalUrl} 不存在`);
  next(error);
};

/**
 * 处理异步函数中的错误
 * 用于包装async路由处理器，自动捕获错误
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 清理敏感信息
 */
const sanitizeBody = (body: any): any => {
  if (!body) return body;

  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '***SENSITIVE***';
    }
  }

  return sanitized;
};

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
