/**
 * 计数器模型
 * 用于生成递增的订单号
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ICounter extends Document {
  date: string;           // 日期标识 YYYYMMDD
  sequence: number;       // 当前序号
  updatedAt: Date;
}

const CounterSchema: Schema = new Schema({
  date: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  sequence: {
    type: Number,
    required: true,
    default: 0,
  },
}, {
  timestamps: { createdAt: false },
});

export default mongoose.model<ICounter>('Counter', CounterSchema);