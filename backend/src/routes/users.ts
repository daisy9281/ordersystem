/**
 * 用户路由
 * 定义用户相关的API端点
 */

import express from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/UserController';
import { authenticate } from '../middleware/auth';
import { validate, validators } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter';
import { registerAntiSpam } from '../middleware/antiSpam';

const router = express.Router();

/**
 * @route   POST /api/users/register
 * @desc    用户注册
 * @access  Public
 */
router.post(
  '/register',
  registerLimiter,
  registerAntiSpam,
  validate(validators.register),
  asyncHandler(register)
);

/**
 * @route   POST /api/users/login
 * @desc    用户登录
 * @access  Public
 */
router.post(
  '/login',
  loginLimiter,
  validate(validators.login),
  asyncHandler(login)
);

/**
 * @route   GET /api/users/profile
 * @desc    获取当前用户资料
 * @access  Private
 */
router.get(
  '/profile',
  authenticate,
  asyncHandler(getProfile)
);

/**
 * @route   PUT /api/users/profile
 * @desc    更新用户资料
 * @access  Private
 */
router.put(
  '/profile',
  authenticate,
  validate(validators.updateProfile),
  asyncHandler(updateProfile)
);

export default router;
