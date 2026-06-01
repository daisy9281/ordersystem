/**
 * 速率限制中间件
 * 防止API滥用和暴力攻击
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { AppError, ErrorCode } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * 生成速率限制的key
 */
const keyGenerator = (req: Request): string => {
  const forwarded = req.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.ip;
  const userId = (req as any).user?._id?.toString();
  
  return userId ? `${ip}-${userId}` : ip || 'unknown';
};

/**
 * 速率限制处理器
 */
const handler = (req: Request, res: Response, next: Function) => {
  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    userId: (req as any).user?._id?.toString(),
    path: req.path,
  });

  const error = AppError.badRequest(
    '请求过于频繁，请稍后再试',
    {
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      retryAfter: res.getHeader('Retry-After'),
    }
  );
  
  res.status(429).json({
    success: false,
    error: {
      code: error.errorCode,
      message: error.message,
      details: error.details,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * 开发环境速率限制配置（更宽松）
 */
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * 通用API速率限制器
 * 限制所有API请求的频率
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟窗口
  max: isDevelopment ? 1000 : 100, // 开发环境放宽限制
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler,
  message: {
    success: false,
    error: {
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      message: '请求过于频繁，请稍后再试',
    },
    timestamp: new Date().toISOString(),
  },
});

/**
 * 登录速率限制器
 * 限制登录尝试次数，防止暴力破解
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟窗口
  max: isDevelopment ? 50 : 5, // 开发环境放宽限制
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // 成功的请求不计入
  keyGenerator: (req: Request) => {
    const forwarded = req.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.ip;
    return `login-${ip}`;
  },
  handler,
});

/**
 * 注册速率限制器
 * 限制注册请求频率
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时窗口
  max: isDevelopment ? 30 : 3, // 开发环境放宽限制
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const forwarded = req.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.ip;
    return `register-${ip}`;
  },
  handler,
});

/**
 * 文件上传速率限制器
 * 限制文件上传请求频率
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟窗口
  max: isDevelopment ? 100 : 10, // 开发环境放宽限制
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler,
});

/**
 * 评论速率限制器
 * 限制用户发布评论的频率
 */
export const commentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟窗口
  max: isDevelopment ? 50 : 5, // 开发环境放宽限制
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler,
});

/**
 * 订单操作速率限制器
 * 限制订单相关操作的频率
 */
export const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟窗口
  max: isDevelopment ? 200 : 20, // 开发环境放宽限制
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler,
});

export default {
  apiLimiter,
  loginLimiter,
  registerLimiter,
  uploadLimiter,
  commentLimiter,
  orderLimiter,
};
