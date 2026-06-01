# 订单系统后端

## 环境要求

- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm >= 9.0.0

## 安装

```bash
npm install
```

## 配置

创建 `.env` 文件：

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ordersystem
JWT_SECRET=your-secret-key-here
```

## 启动

```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

## API 端点

### 用户接口
- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录
- `GET /api/users/profile` - 获取用户信息
- `PUT /api/users/profile` - 更新用户信息

### 商品接口
- `GET /api/products` - 获取商品列表
- `GET /api/products/:id` - 获取商品详情
- `POST /api/products` - 创建商品（管理员）
- `PUT /api/products/:id` - 更新商品（管理员）
- `DELETE /api/products/:id` - 删除商品（管理员）

### 订单接口
- `GET /api/orders` - 获取订单列表
- `GET /api/orders/admin` - 获取所有订单（管理员）
- `GET /api/orders/:id` - 获取订单详情
- `POST /api/orders` - 创建订单
- `PUT /api/orders/:id/status` - 更新订单状态（管理员）
- `PUT /api/orders/:id/pay` - 支付订单
- `DELETE /api/orders/:id` - 取消订单
- `POST /api/orders/:id/images` - 上传制作进度图片（管理员）
- `GET /api/orders/:id/images` - 获取制作进度图片
- `DELETE /api/orders/:id/images/:imageId` - 删除进度图片（管理员）
- `POST /api/orders/:id/comments` - 添加评论/修改请求
- `GET /api/orders/:id/comments` - 获取评论列表
- `PUT /api/orders/:id/comments/:commentId` - 处理修改请求（管理员）

## 默认管理员账号

- 邮箱：admin@example.com
- 密码：admin123
