/**
 * 订单号生成工具
 * 格式: YYYYMMDD + 6位序列号
 * 例如: 20260529000001
 */

import Counter from '../models/Counter';

/**
 * 获取当前日期字符串 YYYYMMDD
 */
const getTodayString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

/**
 * 生成唯一的订单号
 * 使用原子操作确保并发安全
 */
export const generateOrderNumber = async (): Promise<string> => {
  const today = getTodayString();

  // 使用 findOneAndUpdate 原子操作来递增计数器
  const counter = await Counter.findOneAndUpdate(
    { date: today },
    { $inc: { sequence: 1 } },
    {
      new: true,
      upsert: true,
      useFindAndModify: false,
    }
  );

  // 格式化为 6 位序列号
  const sequenceStr = String(counter.sequence).padStart(6, '0');
  
  return `${today}${sequenceStr}`;
};

export default generateOrderNumber;