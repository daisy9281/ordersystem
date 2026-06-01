import mongoose from 'mongoose';
import Product from '../models/Product';

const initProducts = async (): Promise<void> => {
  const products = [
    {
      name: '珍珠奶茶',
      description: '经典珍珠奶茶，Q弹珍珠配上香浓奶茶',
      price: 18,
      category: '奶茶',
      type: 'milk_tea',
      image: '/uploads/products/milk-tea.jpg',
      stock: 100,
      status: 'active',
      estimatedDays: 0,
      modificationFee: 0,
      freeModificationCount: 0,
    },
    {
      name: '芋泥波波奶茶',
      description: '香甜芋泥配上手工波波，口感丰富',
      price: 22,
      category: '奶茶',
      type: 'milk_tea',
      image: '/uploads/products/taro-milk.jpg',
      stock: 80,
      status: 'active',
      estimatedDays: 0,
      modificationFee: 0,
      freeModificationCount: 0,
    },
    {
      name: '芝芝莓莓',
      description: '新鲜草莓配芝士奶盖，酸甜可口',
      price: 25,
      category: '奶茶',
      type: 'milk_tea',
      image: '/uploads/products/strawberry.jpg',
      stock: 60,
      status: 'active',
      estimatedDays: 0,
      modificationFee: 0,
      freeModificationCount: 0,
    },
    {
      name: '手工皮具钱包',
      description: '精选头层牛皮，手工缝制，简约耐用',
      price: 168,
      category: '手工皮具',
      type: 'handmade',
      image: '/uploads/products/leather-wallet.jpg',
      stock: 20,
      status: 'active',
      estimatedDays: 7,
      modificationFee: 20,
      freeModificationCount: 1,
    },
    {
      name: '手工皮质手提包',
      description: '时尚手提包，适合日常通勤，容量大',
      price: 388,
      category: '手工皮具',
      type: 'handmade',
      image: '/uploads/products/leather-bag.jpg',
      stock: 10,
      status: 'active',
      estimatedDays: 10,
      modificationFee: 30,
      freeModificationCount: 2,
    },
    {
      name: '手工陶瓷杯',
      description: '手工拉坯陶瓷杯，釉色独特，每件都是孤品',
      price: 88,
      category: '手工陶瓷',
      type: 'handmade',
      image: '/uploads/products/ceramic-cup.jpg',
      stock: 30,
      status: 'active',
      estimatedDays: 5,
      modificationFee: 15,
      freeModificationCount: 1,
    },
    {
      name: '手工木质首饰盒',
      description: '精选胡桃木，手工打磨，精致收纳',
      price: 258,
      category: '手工木艺',
      type: 'handmade',
      image: '/uploads/products/wooden-box.jpg',
      stock: 15,
      status: 'active',
      estimatedDays: 7,
      modificationFee: 25,
      freeModificationCount: 1,
    },
    {
      name: '奶油顶抹茶',
      description: '日式抹茶配鲜奶油，清新回甘',
      price: 20,
      category: '奶茶',
      type: 'milk_tea',
      image: '/uploads/products/matcha.jpg',
      stock: 70,
      status: 'active',
      estimatedDays: 0,
      modificationFee: 0,
      freeModificationCount: 0,
    },
  ];

  try {
    // 检查是否已有商品
    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`商品表已有 ${count} 条数据，跳过初始化`);
      return;
    }

    // 插入商品数据
    await Product.insertMany(products);
    console.log(`成功初始化 ${products.length} 条商品数据`);
  } catch (error) {
    console.error('初始化商品数据失败:', error);
    throw error;
  }
};

export default initProducts;