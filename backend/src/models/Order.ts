/**
 * 订单数据模型
 * 包含完整的订单生命周期管理
 */

import mongoose, { Document, Schema, Types } from 'mongoose';

/**
 * 订单项接口
 */
export interface IOrderItem {
  productId: Types.ObjectId;
  quantity: number;
  price: number;
}

/**
 * 进度图片接口
 */
export interface IProgressImage {
  url: string;
  description?: string;
  uploadedAt: Date;
}

/**
 * 评论接口
 */
export interface IComment {
  userId: Types.ObjectId;
  content: string;
  type: 'comment' | 'modification_request';
  status?: 'pending' | 'approved' | 'rejected';
  reply?: string;
  createdAt: Date;
}

/**
 * 收货地址接口
 */
export interface IShippingAddress {
  name: string;
  phone: string;
  address: string;
}

/**
 * 订单状态枚举
 */
export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'ready' | 'completed' | 'cancelled';

/**
 * 支付状态枚举
 */
export type PaymentStatus = 'pending' | 'paid' | 'failed';

/**
 * 订单接口定义
 */
export interface IOrder extends Document {
  orderNumber: string;      // 订单号 YYYYMMDD + 6位序列号
  userId: Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  modificationAmount: number;
  modificationCount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress?: IShippingAddress;
  progressImages: IProgressImage[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;

  // 方法
  canCancel(): boolean;
  canPay(): boolean;
  canModify(): boolean;
  calculateModificationFee(): Promise<number>;
}

/**
 * 订单Schema
 */
const OrderSchema: Schema = new Schema({
  orderNumber: {
    type: String,
    unique: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '用户ID是必填项'],
    index: true,
  },
  items: {
    type: [{
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, '商品ID是必填项'],
      },
      quantity: {
        type: Number,
        required: [true, '数量是必填项'],
        min: [1, '数量至少为1'],
      },
      price: {
        type: Number,
        required: [true, '价格是必填项'],
        min: [0, '价格不能为负数'],
      },
    }],
    validate: {
      validator: (v: IOrderItem[]) => v && v.length > 0,
      message: '订单至少需要一项商品',
    },
  },
  totalAmount: {
    type: Number,
    required: [true, '总金额是必填项'],
    min: [0, '总金额不能为负数'],
    index: true,
  },
  modificationAmount: {
    type: Number,
    default: 0,
    min: [0, '修改金额不能为负数'],
  },
  modificationCount: {
    type: Number,
    default: 0,
    min: [0, '修改次数不能为负数'],
  },
  status: {
    type: String,
    required: [true, '订单状态是必填项'],
    default: 'pending',
    enum: {
      values: ['pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled'],
      message: '订单状态不合法',
    },
    index: true,
  },
  paymentStatus: {
    type: String,
    default: 'pending',
    enum: {
      values: ['pending', 'paid', 'failed'],
      message: '支付状态不合法',
    },
  },
  shippingAddress: {
    name: {
      type: String,
      trim: true,
      maxlength: [50, '收货人姓名最多50个字符'],
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: (v: string) => {
          if (!v) return true;
          return /^1[3-9]\d{9}$/.test(v);
        },
        message: '请输入有效的手机号码',
      },
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, '收货地址最多200个字符'],
    },
  },
  progressImages: [{
    url: {
      type: String,
      required: [true, '图片URL是必填项'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, '图片描述最多200个字符'],
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  comments: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '用户ID是必填项'],
    },
    content: {
      type: String,
      required: [true, '评论内容是必填项'],
      maxlength: [1000, '评论内容最多1000个字符'],
    },
    type: {
      type: String,
      required: [true, '评论类型是必填项'],
      enum: {
        values: ['comment', 'modification_request'],
        message: '评论类型必须是comment或modification_request',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
    },
    reply: {
      type: String,
      maxlength: [500, '回复最多500个字符'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.__v;
      // 将 items.productId 转换为字符串，便于前端使用
      if (ret.items && Array.isArray(ret.items)) {
        ret.items = ret.items.map(item => ({
          ...item,
          productId: item.productId ? String(item.productId) : item.productId,
        }));
      }
      // 将 comments.userId 转换为字符串
      if (ret.comments && Array.isArray(ret.comments)) {
        ret.comments = ret.comments.map(comment => ({
          ...comment,
          userId: comment.userId ? String(comment.userId) : comment.userId,
        }));
      }
      // 将 userId 转换为字符串
      if (ret.userId) {
        ret.userId = String(ret.userId);
      }
      return ret;
    },
  },
});

// 评论默认状态处理
OrderSchema.pre('save', function(next) {
  this.comments.forEach((comment: any) => {
    if (!comment.status && comment.type === 'modification_request') {
      comment.status = 'pending';
    }
  });
  next();
});

/**
 * 检查订单是否可以取消
 */
OrderSchema.methods.canCancel = function(): boolean {
  return ['pending', 'paid'].includes(this.status);
};

/**
 * 检查订单是否可以支付
 */
OrderSchema.methods.canPay = function(): boolean {
  return this.status === 'pending' && this.paymentStatus === 'pending';
};

/**
 * 检查订单是否可以修改
 */
OrderSchema.methods.canModify = function(): boolean {
  return ['pending', 'paid'].includes(this.status);
};

/**
 * 计算修改费用
 */
OrderSchema.methods.calculateModificationFee = async function(): Promise<number> {
  const Product = mongoose.model('Product');
  let totalFee = 0;

  for (const item of this.items) {
    const product = await Product.findById(item.productId);
    if (product) {
      const paidModifications = this.modificationCount - product.freeModificationCount;
      if (paidModifications > 0) {
        totalFee += product.modificationFee * paidModifications * item.quantity;
      }
    }
  }

  return totalFee;
};

/**
 * 获取用户的订单
 */
OrderSchema.statics.getUserOrders = function(userId: Types.ObjectId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

/**
 * 获取订单详情（带用户和商品信息）
 */
OrderSchema.statics.getOrderWithDetails = function(orderId: Types.ObjectId) {
  return this.findById(orderId)
    .populate('userId', 'username email phone')
    .populate('items.productId');
};

// 添加复合索引以提高查询性能
OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, paymentStatus: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.model<IOrder>('Order', OrderSchema);
