/**
 * 订单控制器
 * 处理订单创建、查询、更新、评论等功能
 */

import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendPaginated, createPaginatedData, AppError } from '../utils/response';
import { logger } from '../utils/logger';
import { generateOrderNumber } from '../utils/orderNumber';

/**
 * 获取当前用户的所有订单
 * @route GET /api/orders
 */
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    // 构建查询条件
    const query: any = { userId: req.user._id };
    if (status) {
      query.status = status;
    }

    // 分页
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 执行查询
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('items.productId', 'name image price')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      Order.countDocuments(query),
    ]);

    const paginatedData = createPaginatedData(orders, total, pageNum, limitNum);

    logger.info('Orders retrieved successfully', {
      userId: req.user._id,
      count: orders.length,
      total,
      requestId: req.requestId,
    });

    sendPaginated(res, paginatedData);
  } catch (error: any) {
    logger.error('Get orders failed', error, {
      userId: req.user._id,
      requestId: req.requestId,
    });
    throw error;
  }
};

/**
 * 获取所有订单（管理员）
 * @route GET /api/orders/admin
 */
export const getAllOrdersAdmin = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    // 构建查询条件
    const query: any = {};
    if (status) {
      query.status = status;
    }

    // 分页
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 执行查询
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('userId', 'username email phone')
        .populate('items.productId', 'name image price')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      Order.countDocuments(query),
    ]);

    const paginatedData = createPaginatedData(orders, total, pageNum, limitNum);

    logger.info('Admin retrieved all orders', {
      count: orders.length,
      total,
      requestId: req.requestId,
    });

    sendPaginated(res, paginatedData);
  } catch (error: any) {
    logger.error('Get admin orders failed', error, {
      requestId: req.requestId,
    });
    throw error;
  }
};

/**
 * 获取单个订单详情
 * @route GET /api/orders/:id
 */
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('userId', 'username email phone')
      .populate('items.productId', 'name image price');

    if (!order) {
      throw AppError.notFound('订单不存在');
    }

    // 检查权限
    const isAdmin = req.user.role === 'admin';
    const isOwner = order.userId._id.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin) {
      throw AppError.forbidden('无权访问此订单');
    }

    logger.info('Order retrieved successfully', {
      orderId: id,
      userId: req.user._id,
      requestId: req.requestId,
    });

    sendSuccess(res, { order });
  } catch (error: any) {
    logger.error('Get order failed', error, {
      orderId: req.params.id,
      requestId: req.requestId,
    });
    throw error;
  }
};

/**
 * 创建订单
 * @route POST /api/orders
 */
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      throw AppError.badRequest('订单项不能为空');
    }

    let totalAmount = 0;
    const orderItems = [];

    // 验证商品并计算总价
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        throw AppError.notFound(`商品 ${item.productId} 不存在`);
      }

      if (product.status !== 'active') {
        throw AppError.badRequest(`商品 ${product.name} 已下架`);
      }

      if (!product.hasEnoughStock(item.quantity)) {
        throw AppError.badRequest(
          `商品 ${product.name} 库存不足（当前库存: ${product.stock}）`
        );
      }

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });

      totalAmount += product.price * item.quantity;

      // 减少库存
      await product.decreaseStock(item.quantity);
    }

    // 生成订单号
    const orderNumber = await generateOrderNumber();

    // 创建订单
    const order = await Order.create({
      orderNumber,
      userId: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
    });

    logger.info('Order created successfully', {
      orderId: order._id,
      userId: req.user._id,
      totalAmount,
      itemsCount: items.length,
      requestId: req.requestId,
    });

    // 返回完整的订单信息
    const populatedOrder = await Order.findById(order._id)
      .populate('items.productId', 'name image price');

    sendSuccess(res, { order: populatedOrder }, '订单创建成功');
  } catch (error: any) {
    logger.error('Create order failed', error, {
      userId: req.user._id,
      requestId: req.requestId,
    });
    throw error;
  }
};

/**
 * 更新订单状态（管理员）
 * @route PUT /api/orders/:id/status
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      throw AppError.badRequest('状态不能为空');
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      throw AppError.notFound('订单不存在');
    }

    logger.info('Order status updated', {
      orderId: id,
      newStatus: status,
      updatedBy: (req as any).user?._id,
      requestId: req.requestId,
    });

    sendSuccess(res, { order }, '订单状态更新成功');
  } catch (error: any) {
    logger.error('Update order status failed', error, {
      orderId: req.params.id,
      requestId: req.requestId,
    });
    throw error;
  }
};

/**
 * 支付订单
 * @route PUT /api/orders/:id/pay
 */
export const payOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      throw AppError.notFound('订单不存在');
    }

    // 检查所有权
    if (order.userId.toString() !== req.user._id.toString()) {
      throw AppError.forbidden('无权操作此订单');
    }

    // 检查是否可以支付
    if (!order.canPay()) {
      throw AppError.badRequest('订单状态不允许支付');
    }

    // 更新状态
    order.status = 'paid';
    order.paymentStatus = 'paid';
    await order.save();

    logger.info('Order paid successfully', {
      orderId: id,
      userId: req.user._id,
      requestId: req.requestId,
    });

    sendSuccess(res, { order }, '支付成功');
  } catch (error: any) {
    logger.error('Pay order failed', error, {
      orderId: req.params.id,
      requestId: req.requestId,
    });
    throw error;
  }
};

/**
 * 取消订单
 * @route DELETE /api/orders/:id
 */
export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      throw AppError.notFound('订单不存在');
    }

    // 检查所有权
    if (order.userId.toString() !== req.user._id.toString()) {
      throw AppError.forbidden('无权操作此订单');
    }

    // 检查是否可以取消
    if (!order.canCancel()) {
      throw AppError.badRequest('订单状态不允许取消');
    }

    // 更新状态
    order.status = 'cancelled';
    await order.save();

    // 恢复库存
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        await product.increaseStock(item.quantity);
      }
    }

    logger.info('Order cancelled successfully', {
      orderId: id,
      userId: req.user._id,
      requestId: req.requestId,
    });

    sendSuccess(res, { order }, '订单取消成功');
  } catch (error: any) {
    logger.error('Cancel order failed', error, {
      orderId: req.params.id,
      requestId: req.requestId,
    });
    throw error;
  }
};

/**
 * 删除订单（管理员）
 * 从数据库中物理删除订单记录
 * @route DELETE /api/orders/admin/:id
 */
export const deleteOrderAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      throw AppError.notFound('订单不存在');
    }

    // 如果订单已支付，先恢复库存
    if (order.status !== 'pending' && order.status !== 'cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          await product.increaseStock(item.quantity);
        }
      }
    }

    // 物理删除订单
    await Order.findByIdAndDelete(id);

    logger.info('Order deleted by admin', {
      orderId: id,
      deletedBy: (req as any).user?._id,
      requestId: req.requestId,
    });

    sendSuccess(res, null, '订单删除成功');
  } catch (error: any) {
    logger.error('Delete order admin failed', error, {
      orderId: req.params.id,
      requestId: req.requestId,
    });
    throw error;
  }
};

/**
 * 上传进度图片（管理员）
 * @route POST /api/orders/:id/images
 */
export const uploadProgressImage = async (req: any, res: Response) => {
  try {
    if (!req.file) {
      throw AppError.badRequest('请上传图片');
    }

    const { id } = req.params;
    const { description } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      throw AppError.notFound('订单不存在');
    }

    const imageUrl = `/api/uploads/${req.file.filename}`;

    order.progressImages.push({
      url: imageUrl,
      description,
      uploadedAt: new Date(),
    });

    await order.save();

    logger.info('Progress image uploaded', {
      orderId: id,
      imageUrl,
      uploadedBy: (req as any).user?._id,
      requestId: req.requestId,
    });

    sendSuccess(res, { imageUrl, order }, '图片上传成功');
  } catch (error: any) {
    logger.error('Upload progress image failed', error, {
      orderId: req.params.id,
      requestId: req.requestId,
    });
    throw error;
  }
};

/**
 * 获取订单进度图片
 * @route GET /api/orders/:id/images
 */
export const getProgressImages = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      throw AppError.notFound('订单不存在');
    }

    // 检查权限
    const isAdmin = req.user.role === 'admin';
    const isOwner = order.userId.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin) {
      throw AppError.forbidden('无权访问');
    }

    sendSuccess(res, { progressImages: order.progressImages });
  } catch (error: any) {
    logger.error('Get progress images failed', error, {
      orderId: req.params.id,
      requestId: req.requestId,
    });
    throw error;
  }
};

/**
 * 删除进度图片（管理员）
 * @route DELETE /api/orders/:id/images/:imageId
 */
export const deleteProgressImage = async (req: Request, res: Response) => {
  try {
    const { id, imageId } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      throw AppError.notFound('订单不存在');
    }

    const imageIndex = parseInt(imageId);

    if (imageIndex < 0 || imageIndex >= order.progressImages.length) {
      throw AppError.badRequest('图片索引不存在');
    }

    order.progressImages.splice(imageIndex, 1);
    await order.save();

    logger.info('Progress image deleted', {
      orderId: id,
      imageId,
      deletedBy: (req as any).user?._id,
      requestId: req.requestId,
    });

    sendSuccess(res, null, '图片删除成功');
  } catch (error: any) {
    logger.error('Delete progress image failed', error, {
      orderId: req.params.id,
      requestId: req.requestId,
    });
    throw error;
  }
};

/**
 * 添加评论或修改请求
 * @route POST /api/orders/:id/comments
 */
export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content, type } = req.body;

    if (!content || content.trim().length === 0) {
      throw AppError.badRequest('评论内容不能为空');
    }

    const order = await Order.findById(id);

    if (!order) {
      throw AppError.notFound('订单不存在');
    }

    // 检查所有权
    if (order.userId.toString() !== req.user._id.toString()) {
      throw AppError.forbidden('无权操作此订单');
    }

    const comment = {
      userId: req.user._id,
      content: content.trim(),
      type: type || 'comment',
      status: type === 'modification_request' ? 'pending' : undefined,
      createdAt: new Date(),
    };

    order.comments.push(comment as any);
    await order.save();

    logger.info('Comment added successfully', {
      orderId: id,
      commentType: type,
      userId: req.user._id,
      requestId: req.requestId,
    });

    // 返回新添加的评论
    const addedComment = order.comments[order.comments.length - 1];

    sendSuccess(res, { comment: addedComment }, '评论添加成功');
  } catch (error: any) {
    logger.error('Add comment failed', error, {
      orderId: req.params.id,
      requestId: req.requestId,
    });
    throw error;
  }
};

/**
 * 获取订单评论
 * @route GET /api/orders/:id/comments
 */
export const getComments = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('comments.userId', 'username email');

    if (!order) {
      throw AppError.notFound('订单不存在');
    }

    // 检查权限
    const isAdmin = req.user.role === 'admin';
    const isOwner = order.userId.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin) {
      throw AppError.forbidden('无权访问');
    }

    sendSuccess(res, { comments: order.comments });
  } catch (error: any) {
    logger.error('Get comments failed', error, {
      orderId: req.params.id,
      requestId: req.requestId,
    });
    throw error;
  }
};

/**
 * 处理修改请求（管理员）
 * @route PUT /api/orders/:id/comments/:commentId
 */
export const handleModificationRequest = async (req: Request, res: Response) => {
  try {
    const { id, commentId } = req.params;
    const { status, reply } = req.body;

    if (!status) {
      throw AppError.badRequest('状态不能为空');
    }

    const order = await Order.findById(id);

    if (!order) {
      throw AppError.notFound('订单不存在');
    }

    const commentIndex = order.comments.findIndex(
      (c: any) => c._id.toString() === commentId
    );

    if (commentIndex === -1) {
      throw AppError.notFound('评论不存在');
    }

    // 更新评论状态
    order.comments[commentIndex].status = status;
    if (reply) {
      order.comments[commentIndex].reply = reply;
    }

    // 如果批准了修改请求
    if (status === 'approved') {
      order.modificationCount += 1;

      // 计算修改费用
      let additionalFee = 0;
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          const paidModifications = order.modificationCount - product.freeModificationCount;
          if (paidModifications > 0) {
            additionalFee += product.modificationFee * item.quantity;
          }
        }
      }

      order.modificationAmount = additionalFee;
    }

    await order.save();

    logger.info('Modification request handled', {
      orderId: id,
      commentId,
      newStatus: status,
      modificationCount: order.modificationCount,
      handledBy: (req as any).user?._id,
      requestId: req.requestId,
    });

    sendSuccess(res, { comment: order.comments[commentIndex] }, '处理成功');
  } catch (error: any) {
    logger.error('Handle modification request failed', error, {
      orderId: req.params.id,
      commentId: req.params.commentId,
      requestId: req.requestId,
    });
    throw error;
  }
};

export default {
  getAllOrders,
  getAllOrdersAdmin,
  getOrderById,
  createOrder,
  updateOrderStatus,
  payOrder,
  cancelOrder,
  deleteOrderAdmin,
  uploadProgressImage,
  getProgressImages,
  deleteProgressImage,
  addComment,
  getComments,
  handleModificationRequest,
};
