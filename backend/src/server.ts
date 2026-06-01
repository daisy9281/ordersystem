/**
 * 服务器入口文件
 * 配置并启动Express服务器
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config();

// 导入配置和连接
import connectDB from './config/database';

// 导入中间件
import { requestLogger, performanceMonitor } from './middleware/requestLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { sanitizeInput } from './middleware/validation';
import { apiLimiter } from './middleware/rateLimiter';
import {
  helmetMiddleware,
  hppMiddleware,
  corsMiddleware,
  noIndexMiddleware,
  securityLogger,
  requestSizeLimiter,
} from './middleware/security';

// 导入路由
import userRoutes from './routes/users';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';

// 导入日志工具
import { logger } from './utils/logger';
import { initTestData } from './utils/initData';

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 5000;

// 连接数据库并初始化测试数据
connectDB().then(() => {
  initTestData();
}).catch((error) => {
  console.error('数据库连接失败:', error);
  process.exit(1);
});

// ========== 中间件配置 ==========

// 安全中间件
app.use(helmetMiddleware);
app.use(hppMiddleware);

// CORS配置
app.use(corsMiddleware);

// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求大小限制
app.use(requestSizeLimiter('10mb'));

// XSS防护 - 清理输入
app.use(sanitizeInput);

// 请求日志
app.use(requestLogger);

// 性能监控
if (process.env.NODE_ENV === 'production') {
  app.use(performanceMonitor(2000)); // 生产环境记录超过2秒的请求
}

// 安全日志
app.use(securityLogger);

// 静态文件服务 - 使用 process.cwd() 确保路径正确
const uploadsDir = path.join(process.cwd(), 'uploads');
app.use('/api/uploads', express.static(uploadsDir));

// 速率限制
app.use('/api', apiLimiter);

// ========== 路由配置 ==========

// API路由
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// API信息端点
app.get('/api', (req, res) => {
  res.json({
    success: true,
    data: {
      name: '订单系统API',
      version: '1.0.0',
      description: '订单系统后端服务',
      endpoints: {
        users: '/api/users',
        products: '/api/products',
        orders: '/api/orders',
        health: '/api/health',
      },
    },
  });
});

// 根路由
app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      message: '订单系统后端服务运行中...',
      documentation: '/api',
      health: '/api/health',
    },
  });
});

// ========== 错误处理 ==========

// 404处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

// ========== 启动服务器 ==========

const server = app.listen(PORT, () => {
  logger.info(`🚀 服务器启动成功`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  });

  console.log(`\n✨ 服务器运行地址:`);
  console.log(`   本地: http://localhost:${PORT}`);
  console.log(`   API:  http://localhost:${PORT}/api`);
  console.log(`   健康检查: http://localhost:${PORT}/api/health\n`);
});

// ========== 进程事件处理 ==========

// 优雅关闭
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} 信号接收，正在关闭服务器...`);

  server.close(() => {
    logger.info('HTTP服务器已关闭');
    process.exit(0);
  });

  // 如果30秒内没有关闭，强制退出
  setTimeout(() => {
    logger.error('无法正常关闭，强制退出');
    process.exit(1);
  }, 30000);
};

// 监听进程信号
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 未捕获的异常处理
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常', error);
  process.exit(1);
});

// 未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝', reason);
});

export default app;