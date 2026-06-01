/**
 * 用户控制器
 * 处理用户注册、登录、资料管理等功能
 */

import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, AppError, ErrorCode } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * 用户注册
 * @route POST /api/users/register
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // 检查用户名是否已存在
    if (await User.isUsernameTaken(username)) {
      throw AppError.badRequest('该用户名已被使用', { field: 'username' });
    }

    // 创建用户
    const user = await User.create({
      username,
      password,
    });

    // 生成token
    const token = generateToken(user._id.toString());

    logger.info('User registered successfully', {
      userId: user._id,
      username: user.username,
      requestId: req.requestId,
    });

    sendSuccess(res, {
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
      },
      token,
    }, '注册成功');
  } catch (error: any) {
    logger.error('User registration failed', error, {
      username: req.body.username,
      requestId: req.requestId,
    });
    throw error;
  }
};

/**
 * 用户登录
 * @route POST /api/users/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    if (!password) {
      throw AppError.badRequest('请输入密码');
    }

    // 查找所有用户并验证密码
    const users = await User.find().select('+password');
    
    let matchedUser = null;
    for (const user of users) {
      const isMatch = await user.comparePassword(password);
      if (isMatch && user.isActive) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) {
      throw AppError.unauthorized('密码错误或账户已被禁用');
    }

    // 更新最后登录时间
    matchedUser.lastLogin = new Date();
    await matchedUser.save();

    // 生成token
    const token = generateToken(matchedUser._id.toString());

    logger.info('User logged in successfully', {
      userId: matchedUser._id,
      username: matchedUser.username,
      requestId: req.requestId,
    });

    sendSuccess(res, {
      user: {
        _id: matchedUser._id,
        username: matchedUser.username,
        role: matchedUser.role,
      },
      token,
    }, '登录成功');
  } catch (error: any) {
    logger.error('User login failed', error, {
      requestId: req.requestId,
    });
    throw error;
  }
};

/**
 * 获取当前用户资料
 * @route GET /api/users/profile
 */
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw AppError.notFound('用户不存在');
    }

    sendSuccess(res, {
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error: any) {
    logger.error('Get profile failed', error, {
      userId: req.user._id,
      requestId: req.requestId,
    });
    throw error;
  }
};

/**
 * 更新用户资料
 * @route PUT /api/users/profile
 */
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.body;
    const updateData: any = {};

    // 如果提供用户名，检查是否被占用
    if (username) {
      const isTaken = await User.isUsernameTaken(username, req.user._id as any);
      if (isTaken) {
        throw AppError.badRequest('该用户名已被使用', { field: 'username' });
      }
      updateData.username = username;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw AppError.notFound('用户不存在');
    }

    logger.info('Profile updated successfully', {
      userId: req.user._id,
      updatedFields: Object.keys(updateData),
      requestId: req.requestId,
    });

    sendSuccess(res, {
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
      },
    }, '资料更新成功');
  } catch (error: any) {
    logger.error('Update profile failed', error, {
      userId: req.user._id,
      requestId: req.requestId,
    });
    throw error;
  }
};

export default {
  register,
  login,
  getProfile,
  updateProfile,
};