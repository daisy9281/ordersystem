/**
 * 订单路由
 * 定义订单相关的API端点
 */

import express from 'express';
import {
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
} from '../controllers/OrderController';
import { authenticate, authenticateAdmin } from '../middleware/auth';
import { validate, validators, validateObjectId } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { upload } from '../middleware/upload';
import {
  orderLimiter,
  uploadLimiter,
  commentLimiter,
} from '../middleware/rateLimiter';

const router = express.Router();

/**
 * @route   GET /api/orders
 * @desc    获取当前用户的所有订单
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  asyncHandler(getAllOrders)
);

/**
 * @route   GET /api/orders/admin
 * @desc    获取所有订单（管理员）
 * @access  Private/Admin
 */
router.get(
  '/admin',
  authenticateAdmin,
  asyncHandler(getAllOrdersAdmin)
);

/**
 * @route   GET /api/orders/:id
 * @desc    获取订单详情
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  validateObjectId('id'),
  asyncHandler(getOrderById)
);

/**
 * @route   POST /api/orders
 * @desc    创建新订单
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  orderLimiter,
  validate(validators.createOrder),
  asyncHandler(createOrder)
);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    更新订单状态（管理员）
 * @access  Private/Admin
 */
router.put(
  '/:id/status',
  authenticateAdmin,
  validateObjectId('id'),
  asyncHandler(updateOrderStatus)
);

/**
 * @route   PUT /api/orders/:id/pay
 * @desc    支付订单
 * @access  Private
 */
router.put(
  '/:id/pay',
  authenticate,
  orderLimiter,
  validateObjectId('id'),
  asyncHandler(payOrder)
);

/**
 * @route   DELETE /api/orders/:id
 * @desc    取消订单
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate,
  validateObjectId('id'),
  asyncHandler(cancelOrder)
);

/**
 * @route   DELETE /api/orders/admin/:id
 * @desc    删除订单（管理员）
 * @access  Private/Admin
 */
router.delete(
  '/admin/:id',
  authenticateAdmin,
  validateObjectId('id'),
  asyncHandler(deleteOrderAdmin)
);

/**
 * @route   POST /api/orders/:id/images
 * @desc    上传进度图片（管理员）
 * @access  Private/Admin
 */
router.post(
  '/:id/images',
  authenticateAdmin,
  uploadLimiter,
  validateObjectId('id'),
  upload.single('image'),
  asyncHandler(uploadProgressImage)
);

/**
 * @route   GET /api/orders/:id/images
 * @desc    获取订单进度图片
 * @access  Private
 */
router.get(
  '/:id/images',
  authenticate,
  validateObjectId('id'),
  asyncHandler(getProgressImages)
);

/**
 * @route   DELETE /api/orders/:id/images/:imageId
 * @desc    删除进度图片（管理员）
 * @access  Private/Admin
 */
router.delete(
  '/:id/images/:imageId',
  authenticateAdmin,
  validateObjectId('id'),
  asyncHandler(deleteProgressImage)
);

/**
 * @route   POST /api/orders/:id/comments
 * @desc    添加评论或修改请求
 * @access  Private
 */
router.post(
  '/:id/comments',
  authenticate,
  commentLimiter,
  validateObjectId('id'),
  validate(validators.addComment),
  asyncHandler(addComment)
);

/**
 * @route   GET /api/orders/:id/comments
 * @desc    获取订单评论
 * @access  Private
 */
router.get(
  '/:id/comments',
  authenticate,
  validateObjectId('id'),
  asyncHandler(getComments)
);

/**
 * @route   PUT /api/orders/:id/comments/:commentId
 * @desc    处理修改请求（管理员）
 * @access  Private/Admin
 */
router.put(
  '/:id/comments/:commentId',
  authenticateAdmin,
  validateObjectId('id'),
  asyncHandler(handleModificationRequest)
);

export default router;
