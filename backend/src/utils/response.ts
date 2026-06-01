/**
 * 统一响应格式和错误处理工具
 * 提供标准的API响应格式和错误处理机制
 */

/**
 * 成功响应接口
 */
interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * 错误响应接口
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

/**
 * 分页响应数据接口
 */
interface PaginatedData<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 分页响应接口
 */
interface PaginatedResponse<T = any> {
  success: true;
  data: PaginatedData<T>;
  timestamp: string;
}

/**
 * 错误代码枚举
 */
export enum ErrorCode {
  // 通用错误 (1000-1999)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // 用户相关错误 (2000-2999)
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',

  // 订单相关错误 (3000-3999)
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  ORDER_CANNOT_CANCEL = 'ORDER_CANNOT_CANCEL',
  ORDER_ALREADY_PAID = 'ORDER_ALREADY_PAID',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',

  // 文件上传相关错误 (4000-4999)
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',

  // 速率限制错误 (5000-5999)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

/**
 * 自定义应用错误类
 */
export class AppError extends Error {
  public statusCode: number;
  public errorCode: ErrorCode;
  public isOperational: boolean;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: ErrorCode = ErrorCode.INTERNAL_ERROR,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * 创建400错误（坏请求）
   */
  static badRequest(message: string, details?: any): AppError {
    return new AppError(message, 400, ErrorCode.BAD_REQUEST, true, details);
  }

  /**
   * 创建401错误（未授权）
   */
  static unauthorized(message: string = '未授权访问'): AppError {
    return new AppError(message, 401, ErrorCode.UNAUTHORIZED);
  }

  /**
   * 创建403错误（禁止访问）
   */
  static forbidden(message: string = '权限不足'): AppError {
    return new AppError(message, 403, ErrorCode.FORBIDDEN);
  }

  /**
   * 创建404错误（未找到）
   */
  static notFound(message: string = '资源不存在'): AppError {
    return new AppError(message, 404, ErrorCode.NOT_FOUND);
  }

  /**
   * 创建500错误（服务器错误）
   */
  static internal(message: string = '服务器内部错误'): AppError {
    return new AppError(message, 500, ErrorCode.INTERNAL_ERROR, false);
  }

  /**
   * 创建验证错误
   */
  static validation(message: string, details?: any): AppError {
    return new AppError(message, 400, ErrorCode.VALIDATION_ERROR, true, details);
  }
}

/**
 * 发送成功响应
 * @param res Express Response对象
 * @param data 响应数据
 * @param message 可选的成功消息
 */
export const sendSuccess = <T = any>(
  res: any,
  data: T,
  message?: string
): void => {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
  res.status(200).json(response);
};

/**
 * 发送分页响应
 * @param res Express Response对象
 * @param data 分页数据
 */
export const sendPaginated = <T = any>(
  res: any,
  data: PaginatedData<T>
): void => {
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
  res.status(200).json(response);
};

/**
 * 发送错误响应
 * @param res Express Response对象
 * @param statusCode HTTP状态码
 * @param message 错误消息
 * @param errorCode 错误代码
 * @param details 可选的错误详情
 */
export const sendError = (
  res: any,
  statusCode: number,
  message: string,
  errorCode: ErrorCode = ErrorCode.INTERNAL_ERROR,
  details?: any
): void => {
  const response: ErrorResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
};

/**
 * 创建分页数据
 * @param items 当前页的数据项
 * @param total 总数
 * @param page 当前页码
 * @param limit 每页数量
 */
export const createPaginatedData = <T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedData<T> => {
  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export default {
  AppError,
  ErrorCode,
  sendSuccess,
  sendPaginated,
  sendError,
  createPaginatedData,
};
