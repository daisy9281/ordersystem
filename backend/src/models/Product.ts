/**
 * 商品数据模型
 * 支持奶茶和手工制作两种类型的商品
 */

import mongoose, { Document, Schema, Types, Model } from 'mongoose';

/**
 * 商品类型枚举
 */
export type ProductType = 'milk_tea' | 'handmade';

/**
 * 商品状态枚举
 */
export type ProductStatus = 'active' | 'inactive';

/**
 * 商品接口定义
 */
export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  category: string;
  type: ProductType;
  image?: string;
  stock: number;
  status: ProductStatus;
  estimatedDays?: number;
  modificationFee: number;
  freeModificationCount: number;
  createdAt: Date;
  updatedAt: Date;

  // 方法
  hasEnoughStock(quantity: number): boolean;
  decreaseStock(quantity: number): Promise<void>;
  increaseStock(quantity: number): Promise<void>;
}

/**
 * 商品模型接口
 */
export interface IProductModel extends Model<IProduct> {
  getAvailable(): Promise<IProduct[]>;
  getByCategory(category: string): Promise<IProduct[]>;
  getByType(type: ProductType): Promise<IProduct[]>;
}

/**
 * 商品Schema
 */
const ProductSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, '商品名称是必填项'],
    trim: true,
    minlength: [1, '商品名称至少需要1个字符'],
    maxlength: [100, '商品名称最多100个字符'],
    index: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, '商品描述最多500个字符'],
  },
  price: {
    type: Number,
    required: [true, '价格是必填项'],
    min: [0, '价格不能为负数'],
    index: true,
  },
  category: {
    type: String,
    required: [true, '分类是必填项'],
    trim: true,
    index: true,
  },
  type: {
    type: String,
    required: [true, '商品类型是必填项'],
    trim: true,
    index: true,
  },
  image: {
    type: String,
    trim: true,
    get: (v: string) => v ? `/api/uploads/${v.split('/').pop()}` : v,
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, '库存不能为负数'],
    index: true,
  },
  status: {
    type: String,
    default: 'active',
    enum: {
      values: ['active', 'inactive'],
      message: '状态必须是active或inactive',
    },
    index: true,
  },
  estimatedDays: {
    type: Number,
    min: [0, '预计天数不能为负数'],
    max: [365, '预计天数不能超过365天'],
  },
  modificationFee: {
    type: Number,
    default: 0,
    min: [0, '修改费用不能为负数'],
  },
  freeModificationCount: {
    type: Number,
    default: 0,
    min: [0, '免费修改次数不能为负数'],
  },
}, {
  timestamps: true,
  toJSON: {
    getters: true,
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    },
  },
});

/**
 * 获取可用商品（库存大于0且状态为active）
 */
ProductSchema.statics.getAvailable = function() {
  return this.find({ status: 'active', stock: { $gt: 0 } });
};

/**
 * 根据分类获取商品
 */
ProductSchema.statics.getByCategory = function(category: string) {
  return this.find({ category, status: 'active' });
};

/**
 * 根据类型获取商品
 */
ProductSchema.statics.getByType = function(type: ProductType) {
  return this.find({ type, status: 'active' });
};

/**
 * 检查库存是否足够
 */
ProductSchema.methods.hasEnoughStock = function(quantity: number): boolean {
  return this.stock >= quantity;
};

/**
 * 减少库存
 */
ProductSchema.methods.decreaseStock = async function(quantity: number): Promise<void> {
  if (!this.hasEnoughStock(quantity)) {
    throw new Error(`库存不足，当前库存: ${this.stock}`);
  }
  this.stock -= quantity;
  await this.save();
};

/**
 * 增加库存
 */
ProductSchema.methods.increaseStock = async function(quantity: number): Promise<void> {
  this.stock += quantity;
  await this.save();
};

// 添加复合索引以提高查询性能
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ type: 1, status: 1 });
ProductSchema.index({ status: 1, stock: 1 });
ProductSchema.index({ price: 1, status: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ name: 'text', description: 'text' }); // 文本搜索索引

export default mongoose.model<IProduct, IProductModel>('Product', ProductSchema);
