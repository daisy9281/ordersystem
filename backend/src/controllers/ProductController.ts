/**
 * 商品控制器
 * 处理商品查询、创建、修改、删除等功能
 */

import { Request, Response } from 'express';
import Product from '../models/Product';
import { sendSuccess, sendPaginated, createPaginatedData, AppError } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * 获取所有商品
 * @route GET /api/products
 */
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { category, type, page = 1, limit = 20 } = req.query;

    // 构建查询条件
    const query: any = { status: 'active' };

    if (category) {
      query.category = category;
    }
    if (type) {
      query.type = type;
    }

    // 分页
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 执行查询
    const [products, total] = await Promise.all([
      Product.find(query)
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      Product.countDocuments(query),
    ]);

    const paginatedData = createPaginatedData(products, total, pageNum, limitNum);

    logger.info('Products retrieved successfully', {
      count: products.length,
      total,
      query,
      requestId: req.requestId,
    });

    sendPaginated(res, paginatedData);
  } catch (error: any) {
    logger.error('Get products failed', error, {
      query: req.query,
      requestId: req.requestId,
    });
    throw error;
  }
};

/**
 * 获取单个商品详情
 * @route GET /api/products/:id
 */
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      throw AppError.notFound('商品不存在');
    }

    logger.info('Product retrieved successfully', {
      productId: id,
      requestId: req.requestId,
    });

    sendSuccess(res, { product });
  } catch (error: any) {
    logger.error('Get product failed', error, {
      productId: req.params.id,
      requestId: req.requestId,
    });
    throw error;
  }
};

/**
 * 创建商品（管理员）
 * @route POST /api/products
 */
export const createProduct = async (req: any, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      category,
      type,
      stock,
      estimatedDays,
      modificationFee,
      freeModificationCount,
    } = req.body;

    // 获取上传的图片路径
    const image = req.file ? `/api/uploads/${req.file.filename}` : undefined;

    // 创建商品
    const product = await Product.create({
      name,
      description,
      price,
      category,
      type,
      image,
      stock: stock || 0,
      estimatedDays,
      modificationFee: modificationFee || 0,
      freeModificationCount: freeModificationCount || 0,
    });

    logger.info('Product created successfully', {
      productId: product._id,
      name: product.name,
      createdBy: (req as any).user?._id,
      requestId: req.requestId,
    });

    sendSuccess(res, { product }, '商品创建成功');
  } catch (error: any) {
    logger.error('Create product failed', error, {
      requestId: req.requestId,
    });
    throw error;
  }
};

/**
 * 更新商品（管理员）
 * @route PUT /api/products/:id
 */
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 移除不允许更新的字段
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      throw AppError.notFound('商品不存在');
    }

    logger.info('Product updated successfully', {
      productId: id,
      updatedFields: Object.keys(updateData),
      updatedBy: (req as any).user?._id,
      requestId: req.requestId,
    });

    sendSuccess(res, { product }, '商品更新成功');
  } catch (error: any) {
    logger.error('Update product failed', error, {
      productId: req.params.id,
      requestId: req.requestId,
    });
    throw error;
  }
};

/**
 * 删除商品（管理员）
 * @route DELETE /api/products/:id
 */
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      throw AppError.notFound('商品不存在');
    }

    logger.info('Product deleted successfully', {
      productId: id,
      deletedBy: (req as any).user?._id,
      requestId: req.requestId,
    });

    sendSuccess(res, null, '商品删除成功');
  } catch (error: any) {
    logger.error('Delete product failed', error, {
      productId: req.params.id,
      requestId: req.requestId,
    });
    throw error;
  }
};

/**
 * 获取商品分类列表
 * @route GET /api/products/categories/list
 */
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Product.distinct('category', { status: 'active' });

    sendSuccess(res, { categories });
  } catch (error: any) {
    logger.error('Get categories failed', error, {
      requestId: req.requestId,
    });
    throw error;
  }
};

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
};
