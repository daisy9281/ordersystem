/**
 * 输入验证中间件
 * 提供全面的输入验证功能，防止XSS和注入攻击
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/response';

/**
 * 验证规则接口
 */
export interface ValidationRule {
  field: string;
  rules: ValidationRuleType[];
  message?: string;
}

/**
 * 验证规则类型
 */
export type ValidationRuleType =
  | 'required'
  | 'email'
  | 'phone'
  | 'minLength'
  | 'maxLength'
  | 'min'
  | 'max'
  | 'pattern'
  | 'isString'
  | 'isNumber'
  | 'isBoolean'
  | 'isArray'
  | 'isObject'
  | 'isMongoId'
  | 'isEnum'
  | 'isIn';

/**
 * 验证规则配置
 */
interface RuleConfig {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enumValues?: any[];
  enumType?: string;
}

/**
 * 验证错误接口
 */
interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * 获取字段值
 */
const getFieldValue = (data: any, field: string): any => {
  const fields = field.split('.');
  let value = data;

  for (const f of fields) {
    if (value === undefined || value === null) return undefined;
    value = value[f];
  }

  return value;
};

/**
 * 验证单个规则
 */
const validateRule = (
  value: any,
  rule: ValidationRuleType,
  config?: RuleConfig
): string | null => {
  switch (rule) {
    case 'required':
      if (value === undefined || value === null || value === '') {
        return '此字段为必填项';
      }
      break;

    case 'email':
      if (value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof value !== 'string' || !emailRegex.test(value)) {
          return '请输入有效的邮箱地址';
        }
      }
      break;

    case 'phone':
      if (value) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (typeof value !== 'string' || !phoneRegex.test(value)) {
          return '请输入有效的手机号码';
        }
      }
      break;

    case 'isString':
      if (value !== undefined && value !== null && typeof value !== 'string') {
        return '此字段必须是字符串';
      }
      break;

    case 'isNumber':
      if (value !== undefined && value !== null) {
        const num = Number(value);
        if (isNaN(num)) {
          return '此字段必须是数字';
        }
      }
      break;

    case 'isBoolean':
      if (value !== undefined && value !== null) {
        if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
          return '此字段必须是布尔值';
        }
      }
      break;

    case 'isArray':
      if (value !== undefined && value !== null && !Array.isArray(value)) {
        return '此字段必须是数组';
      }
      break;

    case 'isObject':
      if (value !== undefined && value !== null && typeof value !== 'object') {
        return '此字段必须是对象';
      }
      break;

    case 'isMongoId':
      if (value) {
        const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!mongoIdRegex.test(value)) {
          return '无效的ID格式';
        }
      }
      break;

    case 'minLength':
      if (value && config?.minLength !== undefined && value.length < config.minLength) {
        return `最小长度为${config.minLength}个字符`;
      }
      break;

    case 'maxLength':
      if (value && config?.maxLength !== undefined && value.length > config.maxLength) {
        return `最大长度为${config.maxLength}个字符`;
      }
      break;

    case 'min':
      if (value !== undefined && value !== null) {
        const num = Number(value);
        if (config?.min !== undefined && num < config.min) {
          return `最小值为${config.min}`;
        }
      }
      break;

    case 'max':
      if (value !== undefined && value !== null) {
        const num = Number(value);
        if (config?.max !== undefined && num > config.max) {
          return `最大值为${config.max}`;
        }
      }
      break;

    case 'pattern':
      if (value && config?.pattern && !config.pattern.test(value)) {
        return '格式不正确';
      }
      break;

    case 'isEnum':
      if (value !== undefined && value !== null && config?.enumValues) {
        if (!config.enumValues.includes(value)) {
          return `必须是以下值之一: ${config.enumValues.join(', ')}`;
        }
      }
      break;
  }

  return null;
};

/**
 * 验证字段
 */
const validateField = (
  data: any,
  field: string,
  rules: ValidationRuleType[],
  config?: RuleConfig
): ValidationError[] => {
  const errors: ValidationError[] = [];
  const value = getFieldValue(data, field);

  for (const rule of rules) {
    const errorMessage = validateRule(value, rule, config);
    if (errorMessage) {
      errors.push({
        field,
        message: errorMessage,
        value,
      });
      break; // 一个字段只返回一个错误
    }
  }

  return errors;
};

/**
 * 创建验证中间件
 */
export const validate = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: ValidationError[] = [];
    const data = req.body;

    for (const rule of rules) {
      const fieldErrors = validateField(
        data,
        rule.field,
        rule.rules,
        // 从rules中提取配置
        rule.rules.includes('minLength') ? { minLength: (rule as any).minLength } :
        rule.rules.includes('maxLength') ? { maxLength: (rule as any).maxLength } :
        rule.rules.includes('min') ? { min: (rule as any).min } :
        rule.rules.includes('max') ? { max: (rule as any).max } :
        rule.rules.includes('pattern') ? { pattern: (rule as any).pattern } :
        rule.rules.includes('isEnum') ? { enumValues: (rule as any).enumValues } :
        undefined
      );

      errors.push(...fieldErrors);
    }

    if (errors.length > 0) {
      const error = AppError.validation('数据验证失败', errors);
      return next(error);
    }

    next();
  };
};

/**
 * XSS清理中间件
 * 清理请求体中的潜在XSS攻击代码
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query) as any;
  }
  next();
};

/**
 * 递归清理对象中的字符串值
 */
const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }

  return obj;
};

/**
 * 清理单个字符串
 */
const sanitizeString = (str: string): string => {
  if (typeof str !== 'string') return str;

  // HTML标签转义
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * 验证MongoDB ObjectId
 */
export const validateObjectId = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

    if (id && !mongoIdRegex.test(id)) {
      const error = AppError.badRequest(`无效的ID格式: ${id}`);
      return next(error);
    }

    next();
  };
};

/**
 * 预定义的验证规则集
 */
export const validators = {
  // 用户注册验证
  register: [
    { field: 'username', rules: ['required', 'isString', 'minLength:3', 'maxLength:30'] },
    { field: 'password', rules: ['required', 'isString', 'minLength:6', 'maxLength:100'] },
  ] as ValidationRule[],

  // 用户登录验证
  login: [
    { field: 'password', rules: ['required', 'isString'] },
  ] as ValidationRule[],

  // 更新用户资料验证
  updateProfile: [
    { field: 'username', rules: ['isString', 'minLength:3', 'maxLength:30'] },
    { field: 'phone', rules: ['isString'] },
  ] as ValidationRule[],

  // 创建订单验证
  createOrder: [
    { field: 'items', rules: ['required', 'isArray'] },
    { field: 'shippingAddress', rules: ['isObject'] },
    { field: 'shippingAddress.phone', rules: ['phone'] },
  ] as ValidationRule[],

  // 添加评论验证
  addComment: [
    { field: 'content', rules: ['required', 'isString', 'minLength:1', 'maxLength:1000'] },
    { field: 'type', rules: ['required', 'isEnum'], enumValues: ['comment', 'modification_request'] },
  ] as ValidationRule[],

  // 创建商品验证
  createProduct: [
    { field: 'name', rules: ['required', 'isString', 'minLength:1', 'maxLength:100'] },
    { field: 'price', rules: ['required', 'isNumber', 'min:0'] },
    { field: 'category', rules: ['required', 'isString'] },
    { field: 'type', rules: ['required', 'isString'] },
  ] as ValidationRule[],
};

export default {
  validate,
  sanitizeInput,
  validateObjectId,
  validators,
};
