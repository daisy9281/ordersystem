/**
 * 安全增强中间件
 * 提供多项安全措施，包括XSS防护、CSRF防护、安全头等
 */

import helmet from 'helmet';
import hpp from 'hpp';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Helmet安全头配置
 */
export const helmetMiddleware = helmet({
  // 防止点击劫持攻击
  frameguard: {
    action: 'deny',
  },
  // 防止浏览器猜测内容类型
  noSniff: true,
  // 强制使用HTTPS
  hsts: {
    maxAge: 31536000, // 1年
    includeSubDomains: true,
    preload: true,
  },
  // 禁用DNS预取
  dnsPrefetchControl: {
    allow: false,
  },
  // 禁用Referrer头
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  // 设置内容安全策略
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:', 'http://localhost:*'],
      connectSrc: ["'self'", 'http://localhost:*'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
});

/**
 * 防止HTTP参数污染
 */
export const hppMiddleware = hpp();

/**
 * CORS配置
 */
export const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    // 允许没有origin的请求（如Postman）
    if (!origin || process.env.ALLOWED_ORIGINS?.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('不允许的跨域来源'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 预检请求缓存24小时
};

/**
 * CORS中间件
 */
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;

  // 设置CORS头
  if (origin && (process.env.ALLOWED_ORIGINS?.includes(origin) || !process.env.ALLOWED_ORIGINS)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
};

/**
 * 禁止搜索引擎索引（生产环境）
 */
export const noIndexMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  }
  next();
};

/**
 * 安全日志中间件
 * 记录可疑的安全事件
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  // 检测可疑的请求
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /union.*select/i,
    /drop\s+table/i,
    /delete\s+from/i,
    /\.git\/config/i,
    /\.env/i,
    /wp-admin/i,
    /phpmyadmin/i,
  ];

  const requestBody = JSON.stringify(req.body);
  const requestUrl = req.originalUrl;

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestBody) || pattern.test(requestUrl)) {
      logger.warn('Suspicious request detected', {
        ip: req.ip,
        method: req.method,
        url: req.originalUrl,
        pattern: pattern.toString(),
        requestId: req.requestId,
      });
      break;
    }
  }

  next();
};

/**
 * 请求大小限制中间件
 */
export const requestSizeLimiter = (maxSize: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.get('content-length');
    
    if (contentLength) {
      const sizeInBytes = parseInt(contentLength);
      const maxSizeInBytes = parseSize(maxSize);

      if (sizeInBytes > maxSizeInBytes) {
        return res.status(413).json({
          success: false,
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: '请求体过大',
            details: {
              maxSize,
              receivedSize: `${(sizeInBytes / 1024 / 1024).toFixed(2)}MB`,
            },
          },
          timestamp: new Date().toISOString(),
        });
      }
    }

    next();
  };
};

/**
 * 解析大小字符串（如'10mb' -> bytes）
 */
const parseSize = (size: string): number => {
  const units: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };

  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = match[2] || 'b';

  return value * (units[unit] || 1);
};

/**
 * 组合所有安全中间件
 */
export const securityMiddleware = [
  helmetMiddleware,
  hppMiddleware,
  corsMiddleware,
  noIndexMiddleware,
  securityLogger,
];

export default {
  helmetMiddleware,
  hppMiddleware,
  corsMiddleware,
  corsOptions,
  noIndexMiddleware,
  securityLogger,
  requestSizeLimiter,
  securityMiddleware,
};
