/**
 * 反爬虫中间件
 * 提供多种防护措施防止自动化爬虫攻击
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * 常见爬虫的User-Agent模式
 * 注意：不包含 axios，因为前端使用 axios 发送请求
 */
const SPAM_USER_AGENTS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python/i,
  /ruby/i,
  /php/i,
  /java/i,
  /node/i,
  /httpclient/i,
  /okhttp/i,
  /postman/i,
  /insomnia/i,
];

/**
 * 检查User-Agent是否可疑
 */
const isSuspiciousUserAgent = (userAgent: string | undefined): boolean => {
  if (!userAgent) return true;
  
  return SPAM_USER_AGENTS.some(pattern => pattern.test(userAgent));
};

/**
 * 检查请求头是否完整
 */
const isValidRequestHeaders = (req: Request): boolean => {
  // 检查必要的请求头
  const requiredHeaders = ['accept', 'accept-language', 'user-agent'];
  
  return requiredHeaders.every(header => req.headers[header]);
};

/**
 * 检查请求是否来自合法来源
 */
const isValidReferer = (req: Request): boolean => {
  const referer = req.headers.referer;
  
  // 如果有referer，检查是否来自允许的域名
  if (referer) {
    const allowedOrigins = [
      /^http:\/\/localhost(:\d+)?\//,
      /^https?:\/\/.*\.yourdomain\.com\//,
    ];
    
    return allowedOrigins.some(pattern => pattern.test(referer));
  }
  
  // 没有referer也可能是直接访问，不视为可疑
  return true;
};

/**
 * 检查请求是否过快（可能是自动化工具）
 */
const isRequestTooFast = (req: Request): boolean => {
  const startTime = Number(req.headers['x-request-start']);
  
  if (startTime) {
    const elapsed = Date.now() - startTime;
    // 如果请求在100ms内完成，可能是自动化工具
    return elapsed < 100;
  }
  
  return false;
};

/**
 * 反爬虫中间件
 */
export const antiSpamMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress;
  
  logger.debug('Anti-spam middleware processing', {
    ip,
    path: req.path,
    method: req.method,
    userAgent: req.headers['user-agent'],
  });
  
  // 1. 检查User-Agent
  const userAgent = req.headers['user-agent'];
  const isSuspiciousUA = isSuspiciousUserAgent(userAgent);
  logger.debug('User-Agent check', { userAgent, isSuspiciousUA });
  
  if (isSuspiciousUA) {
    logger.warn('Suspicious user agent blocked', {
      ip,
      userAgent: req.headers['user-agent'],
      path: req.path,
    });
    throw AppError.forbidden('请使用合法的浏览器访问');
  }
  
  // 2. 检查请求头完整性
  const hasValidHeaders = isValidRequestHeaders(req);
  logger.debug('Request headers check', { hasValidHeaders, headers: req.headers });
  
  if (!hasValidHeaders) {
    logger.warn('Missing required headers', {
      ip,
      headers: req.headers,
      path: req.path,
    });
    throw AppError.forbidden('请求不合法');
  }
  
  // 3. 检查referer（可选，因为直接访问可能没有referer）
  // 这个检查比较严格，暂时注释掉
  // if (!isValidReferer(req)) {
  //   logger.warn('Invalid referer', {
  //     ip,
  //     referer: req.headers.referer,
  //     path: req.path,
  //   });
  //   throw AppError.forbidden('请求来源不合法');
  // }
  
  // 4. 检查请求速度
  const isFast = isRequestTooFast(req);
  logger.debug('Request speed check', { isFast });
  
  if (isFast) {
    logger.warn('Request too fast', {
      ip,
      path: req.path,
    });
    throw AppError.badRequest('请求过于频繁，请稍后再试');
  }
  
  logger.debug('Anti-spam middleware passed', { ip, path: req.path });
  next();
};

/**
 * 注册专用反爬虫中间件
 */
export const registerAntiSpam = (req: Request, res: Response, next: NextFunction) => {
  logger.info('Register anti-spam check started', {
    ip: req.ip,
    body: req.body,
  });
  
  antiSpamMiddleware(req, res, () => {
    // 额外的注册特定检查
    logger.debug('Register-specific checks started');
    
    // 检查请求体是否有异常模式
    const body = req.body;
    
    // 如果用户名或密码包含可疑字符
    const suspiciousPatterns = [
      /<script/i,
      /<iframe/i,
      /onclick/i,
      /javascript:/i,
      /union select/i,
      /drop table/i,
    ];
    
    const username = body.username || '';
    const password = body.password || '';
    
    logger.debug('Checking for suspicious patterns', { username, passwordLength: password.length });
    
    const hasSuspiciousPattern = suspiciousPatterns.some(pattern => pattern.test(username) || pattern.test(password));
    if (hasSuspiciousPattern) {
      logger.warn('Suspicious input detected', {
        ip: req.ip,
        path: req.path,
        username,
      });
      throw AppError.badRequest('输入包含非法字符');
    }
    
    // 检查用户名长度
    if (username.length < 3 || username.length > 20) {
      logger.warn('Username length invalid', { username, length: username.length });
      throw AppError.badRequest('用户名长度必须在3-20个字符之间');
    }
    
    // 检查密码强度
    if (password.length < 6) {
      logger.warn('Password too short', { passwordLength: password.length });
      throw AppError.badRequest('密码长度至少需要6个字符');
    }
    
    logger.info('Register anti-spam check passed', { ip: req.ip, username });
    next();
  });
};

export default {
  antiSpamMiddleware,
  registerAntiSpam,
};
