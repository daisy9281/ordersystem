/**
 * 用户数据模型
 * 简化版：只保留用户名和密码
 */

import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * 用户接口定义
 */
export interface IUser extends Document {
  username: string;
  password: string;
  role: 'user' | 'admin';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;

  // 方法
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * 用户模型接口
 */
export interface IUserModel extends Model<IUser> {
  isUsernameTaken(username: string, excludeUserId?: mongoose.Types.ObjectId): Promise<boolean>;
}

/**
 * 用户Schema
 */
const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: [true, '用户名是必填项'],
    unique: true,
    trim: true,
    minlength: [3, '用户名至少需要3个字符'],
    maxlength: [30, '用户名最多30个字符'],
    index: true,
  },
  password: {
    type: String,
    required: [true, '密码是必填项'],
    minlength: [6, '密码至少需要6个字符'],
    select: false, // 默认不返回密码字段
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin'],
      message: '角色必须是user或admin',
    },
    default: 'user',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.password;
      delete ret.__v;
      return ret;
    },
  },
});

/**
 * 密码保存前哈希处理
 */
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

/**
 * 更新时自动哈希密码（如果被修改）
 */
UserSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate() as Partial<IUser>;
  
  if (update && update.password) {
    try {
      const salt = await bcrypt.genSalt(12);
      update.password = await bcrypt.hash(update.password, salt);
      this.setUpdate(update);
    } catch (error: any) {
      next(error);
    }
  }
  
  next();
});

/**
 * 验证密码方法
 */
UserSchema.methods.comparePassword = async function(
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * 验证用户名是否唯一
 */
UserSchema.statics.isUsernameTaken = async function(
  username: string,
  excludeUserId?: mongoose.Types.ObjectId
): Promise<boolean> {
  const query: Record<string, any> = { username: username.toLowerCase() };
  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }
  const user = await this.findOne(query);
  return !!user;
};

// 添加索引以提高查询性能
UserSchema.index({ username: 1, isActive: 1 });
UserSchema.index({ createdAt: -1 });

export default mongoose.model<IUser, IUserModel>('User', UserSchema);