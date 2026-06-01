import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: '未授权访问' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { id: string };
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token无效' });
  }
};

export const authenticateAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: '未授权访问' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { id: string };
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token无效' });
  }
};
