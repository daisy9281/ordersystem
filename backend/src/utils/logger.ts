/**
 * 日志工具
 * 提供统一的日志记录功能，支持不同级别的日志
 */

import fs from 'fs';
import path from 'path';

/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * 日志条目接口
 */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
  };
}

/**
 * 日志配置接口
 */
interface LoggerConfig {
  logDir: string;
  logFile: string;
  errorLogFile: string;
  maxLogSize: number;
  maxFiles: number;
  enableConsole: boolean;
  enableFile: boolean;
}

/**
 * 默认日志配置
 */
const defaultConfig: LoggerConfig = {
  logDir: path.join(process.cwd(), 'logs'),
  logFile: 'app.log',
  errorLogFile: 'error.log',
  maxLogSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  enableConsole: true,
  enableFile: true,
};

/**
 * 日志类
 */
class Logger {
  private config: LoggerConfig;
  private logStream: fs.WriteStream | null = null;
  private errorStream: fs.WriteStream | null = null;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.init();
  }

  /**
   * 初始化日志系统
   */
  private init(): void {
    if (this.config.enableFile) {
      try {
        // 创建日志目录
        if (!fs.existsSync(this.config.logDir)) {
          fs.mkdirSync(this.config.logDir, { recursive: true });
        }

        const logPath = path.join(this.config.logDir, this.config.logFile);
        const errorLogPath = path.join(this.config.logDir, this.config.errorLogFile);

        this.logStream = fs.createWriteStream(logPath, { flags: 'a' });
        this.errorStream = fs.createWriteStream(errorLogPath, { flags: 'a' });

        // 检查文件大小并轮转
        this.rotateLogsIfNeeded(logPath);
        this.rotateLogsIfNeeded(errorLogPath);
      } catch (error) {
        console.error('Failed to initialize log files:', error);
      }
    }
  }

  /**
   * 检查并轮转日志文件
   */
  private rotateLogsIfNeeded(logPath: string): void {
    try {
      if (fs.existsSync(logPath)) {
        const stats = fs.statSync(logPath);
        if (stats.size >= this.config.maxLogSize) {
          this.rotateLog(logPath);
        }
      }
    } catch (error) {
      console.error('Failed to check log rotation:', error);
    }
  }

  /**
   * 轮转日志文件
   */
  private rotateLog(logPath: string): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dir = path.dirname(logPath);
    const basename = path.basename(logPath, path.extname(logPath));
    const ext = path.extname(logPath);
    const rotatedPath = path.join(dir, `${basename}-${timestamp}${ext}`);

    try {
      fs.renameSync(logPath, rotatedPath);

      // 删除超过最大文件数的旧日志
      const files = fs.readdirSync(dir).filter(f => f.startsWith(basename));
      if (files.length > this.config.maxFiles) {
        files.sort();
        const filesToDelete = files.slice(0, files.length - this.config.maxFiles);
        filesToDelete.forEach(file => {
          fs.unlinkSync(path.join(dir, file));
        });
      }
    } catch (error) {
      console.error('Failed to rotate log:', error);
    }
  }

  /**
   * 格式化日志条目
   */
  private formatLogEntry(level: LogLevel, message: string, context?: any, error?: any): string {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        message: error.message || String(error),
        stack: error.stack,
      };
    }

    return JSON.stringify(entry) + '\n';
  }

  /**
   * 写入日志到文件
   */
  private writeToFile(message: string, isError: boolean = false): void {
    const stream = isError ? this.errorStream : this.logStream;
    if (stream) {
      stream.write(message);
    }
  }

  /**
   * 记录日志
   */
  private log(level: LogLevel, message: string, context?: any, error?: any): void {
    const formattedMessage = this.formatLogEntry(level, message, context, error);

    if (this.config.enableConsole) {
      const consoleMessage = `[${level}] ${message}`;
      switch (level) {
        case LogLevel.ERROR:
          console.error(consoleMessage, context || '', error || '');
          break;
        case LogLevel.WARN:
          console.warn(consoleMessage, context || '');
          break;
        case LogLevel.DEBUG:
          console.debug(consoleMessage, context || '');
          break;
        default:
          console.log(consoleMessage, context || '');
      }
    }

    if (this.config.enableFile) {
      this.writeToFile(formattedMessage, level === LogLevel.ERROR);
    }
  }

  /**
   * 调试日志
   */
  debug(message: string, context?: any): void {
    if (process.env.NODE_ENV !== 'production') {
      this.log(LogLevel.DEBUG, message, context);
    }
  }

  /**
   * 信息日志
   */
  info(message: string, context?: any): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * 警告日志
   */
  warn(message: string, context?: any): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * 错误日志
   */
  error(message: string, error?: any, context?: any): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * 关闭日志流
   */
  close(): void {
    if (this.logStream) {
      this.logStream.end();
    }
    if (this.errorStream) {
      this.errorStream.end();
    }
  }
}

// 导出单例
export const logger = new Logger();

// 导出默认实例的方法
export const log = {
  debug: (message: string, context?: any) => logger.debug(message, context),
  info: (message: string, context?: any) => logger.info(message, context),
  warn: (message: string, context?: any) => logger.warn(message, context),
  error: (message: string, error?: any, context?: any) => logger.error(message, error, context),
};

export default logger;
