/**
 * 商品路由
 * 定义商品相关的API端点
 */

import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from '../controllers/ProductController';
import { authenticateAdmin } from '../middleware/auth';
import { validate, validators, validateObjectId } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { upload } from '../middleware/upload';

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    获取所有商品列表
 * @access  Public
 */
router.get(
  '/',
  asyncHandler(getAllProducts)
);

/**
 * @route   GET /api/products/categories
 * @desc    获取所有商品分类
 * @access  Public
 */
router.get(
  '/categories',
  asyncHandler(getCategories)
);

/**
 * @route   GET /api/products/:id
 * @desc    获取单个商品详情
 * @access  Public
 */
router.get(
  '/:id',
  validateObjectId('id'),
  asyncHandler(getProductById)
);

/**
 * @route   POST /api/products
 * @desc    创建新商品（管理员）
 * @access  Private/Admin
 */
router.post(
  '/',
  authenticateAdmin,
  upload.single('image'),
  validate(validators.createProduct),
  asyncHandler(createProduct)
);

/**
 * @route   PUT /api/products/:id
 * @desc    更新商品（管理员）
 * @access  Private/Admin
 */
router.put(
  '/:id',
  authenticateAdmin,
  validateObjectId('id'),
  asyncHandler(updateProduct)
);

/**
 * @route   DELETE /api/products/:id
 * @desc    删除商品（管理员）
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  authenticateAdmin,
  validateObjectId('id'),
  asyncHandler(deleteProduct)
);

export default router;
