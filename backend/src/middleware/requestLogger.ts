/**
 * 请求日志中间件
 * 记录所有HTTP请求的详细信息，包括请求路径、方法、状态码、响应时间等
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * 扩展Request接口以包含请求开始时间
 */
declare global {
  namespace Express {
    interface Request {
      startTime?: number;
      requestId?: string;
    }
  }
}

/**
 * 生成唯一请求ID
 */
const generateRequestId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}`;
};

/**
 * 提取请求信息
 */
const extractRequestInfo = (req: Request) => {
  return {
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    query: req.query,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    requestId: req.requestId,
    userId: (req as any).user?._id?.toString(),
    contentLength: req.get('content-length'),
  };
};

/**
 * 提取响应信息
 */
const extractResponseInfo = (res: Response) => {
  return {
    statusCode: res.statusCode,
    statusMessage: res.statusMessage,
    contentLength: res.get('content-length'),
  };
};

/**
 * 计算响应时间
 */
const calculateResponseTime = (startTime: number): number => {
  return Date.now() - startTime;
};

/**
 * 格式化日志输出
 */
const formatLogMessage = (
  reqInfo: ReturnType<typeof extractRequestInfo>,
  resInfo: ReturnType<typeof extractResponseInfo>,
  responseTime: number,
  extra?: any
): string => {
  const { method, url, ip, requestId, userId } = reqInfo;
  const { statusCode } = resInfo;

  const statusColor = statusCode >= 500 ? '5' :
                       statusCode >= 400 ? '4' :
                       statusCode >= 300 ? '3' : '2';

  return `[${requestId}] ${method} ${url} ${statusCode} ${responseTime}ms - ${ip} ${userId || 'anonymous'}`;
};

/**
 * 请求日志中间件
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // 生成请求ID
  req.requestId = generateRequestId();

  // 记录请求开始时间
  req.startTime = Date.now();

  // 记录请求开始
  const requestInfo = extractRequestInfo(req);
  logger.info('Incoming request', {
    ...requestInfo,
    body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
  });

  // 拦截响应以记录日志
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, callback?: any): Response {
    const responseTime = calculateResponseTime(req.startTime || Date.now());
    const responseInfo = extractResponseInfo(res);

    // 格式化并记录响应
    const logMessage = formatLogMessage(
      requestInfo,
      responseInfo,
      responseTime
    );

    // 根据状态码选择日志级别
    const statusCode = res.statusCode;
    if (statusCode >= 500) {
      logger.error(logMessage, null, {
        ...requestInfo,
        ...responseInfo,
        responseTime,
      });
    } else if (statusCode >= 400) {
      logger.warn(logMessage, {
        ...requestInfo,
        ...responseInfo,
        responseTime,
      });
    } else {
      logger.info(logMessage, {
        ...requestInfo,
        ...responseInfo,
        responseTime,
      });
    }

    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
};

/**
 * 清理请求体中的敏感信息
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

/**
 * 性能监控中间件
 * 记录慢请求（超过指定阈值的请求）
 */
export const performanceMonitor = (threshold: number = 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;

      if (duration > threshold) {
        logger.warn('Slow request detected', {
          method: req.method,
          url: req.originalUrl,
          duration,
          threshold,
        });
      }
    });

    next();
  };
};

export default requestLogger;
