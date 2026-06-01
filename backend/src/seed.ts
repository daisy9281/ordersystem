import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from './models/User';
import Product from './models/Product';

dotenv.config();

const seedData = async () => {
  let mongoServer: MongoMemoryServer | null = null;
  
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    await User.deleteMany({});
    await Product.deleteMany({});

    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      phone: '13800138000',
    });

    const userPassword = await bcrypt.hash('user123', 10);
    await User.create({
      username: 'testuser',
      email: 'user@example.com',
      password: userPassword,
      phone: '13900139000',
    });

    await Product.create([
      {
        name: '珍珠奶茶',
        description: '经典珍珠奶茶，Q弹爽滑',
        price: 15,
        category: '热销',
        type: 'milk_tea',
        stock: 100,
        modificationFee: 0,
        freeModificationCount: 0,
      },
      {
        name: '芋泥波波奶茶',
        description: '香浓芋泥搭配波波',
        price: 18,
        category: '热销',
        type: 'milk_tea',
        stock: 80,
        modificationFee: 0,
        freeModificationCount: 0,
      },
      {
        name: '手工皮具钱包',
        description: '纯手工制作真皮钱包，支持定制',
        price: 299,
        category: '新品',
        type: 'handmade',
        stock: 10,
        estimatedDays: 7,
        modificationFee: 50,
        freeModificationCount: 2,
      },
      {
        name: '手工陶瓷摆件',
        description: '精致手工陶瓷，可用于家居装饰',
        price: 188,
        category: '新品',
        type: 'handmade',
        stock: 15,
        estimatedDays: 14,
        modificationFee: 30,
        freeModificationCount: 1,
      },
      {
        name: '手工银饰戒指',
        description: '925纯银手工戒指，支持刻字',
        price: 168,
        category: '热销',
        type: 'handmade',
        stock: 20,
        estimatedDays: 5,
        modificationFee: 40,
        freeModificationCount: 1,
      },
      {
        name: '芝士奶盖茶',
        description: '浓郁芝士奶盖，茶香四溢',
        price: 22,
        category: '热销',
        type: 'milk_tea',
        stock: 60,
        modificationFee: 0,
        freeModificationCount: 0,
      },
      {
        name: '手工编织围巾',
        description: '纯羊毛手工编织，温暖舒适',
        price: 399,
        category: '新品',
        type: 'handmade',
        stock: 8,
        estimatedDays: 10,
        modificationFee: 60,
        freeModificationCount: 1,
      },
      {
        name: '水果茶',
        description: '新鲜水果制作，清爽解渴',
        price: 16,
        category: '新品',
        type: 'milk_tea',
        stock: 50,
        modificationFee: 0,
        freeModificationCount: 0,
      },
    ]);

    console.log('种子数据创建成功！');
    console.log('管理员账号: admin@example.com / admin123');
    console.log('测试账号: user@example.com / user123');

    if (mongoServer) {
      await mongoServer.stop();
    }
    process.exit(0);
  } catch (error) {
    console.error('种子数据创建失败:', error);
    if (mongoServer) {
      await mongoServer.stop();
    }
    process.exit(1);
  }
};

seedData();
