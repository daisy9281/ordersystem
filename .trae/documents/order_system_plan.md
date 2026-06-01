# 订单系统实现计划

## 1. 需求分析

### 1.1 用户需求概述
用户需要一个通用的订单系统，支持以下核心功能：
- **下单功能**：用户可以选择商品并创建订单（支持奶茶、手工制作等商品类型）
- **订单进度追踪**：实时查看订单制作/处理进度，手工制作商品支持图片上传展示制作过程
- **价格管理**：商品定价、订单金额计算，支持修改次数计费
- **订单管理**：订单列表、详情、状态管理
- **客户互动**：客户可以评论、发起修改请求，支持修改次数统计和计费

### 1.1.1 商品类型说明
| 商品类型 | 特点 | 制作周期 |
|----------|------|----------|
| 奶茶 | 即时制作 | 几分钟 |
| 手工制作 | 需要精细加工 | 数天至数月 |

### 1.2 功能模块划分

| 模块 | 功能描述 | 优先级 |
|------|----------|--------|
| 用户模块 | 用户注册、登录、个人信息管理 | 高 |
| 商品模块 | 商品展示、分类、搜索（支持奶茶/手工制作分类） | 高 |
| 订单模块 | 订单创建、提交、支付、修改次数统计与计费 | 高 |
| 进度追踪模块 | 订单状态流转、进度可视化、制作进度图片上传 | 高 |
| 客户互动模块 | 客户评论、修改请求发起、管理员回复 | 高 |
| 管理后台 | 商品管理、订单管理、进度图片上传、修改请求处理 | 中 |

### 1.3 订单状态流转

```
待支付 → 已支付 → 制作中 → 待取货/配送中 → 已完成/已取消
```

---

## 2. 技术方案

### 2.1 技术栈选择

| 分类 | 技术 | 版本 | 选型理由 | 许可证 |
|------|------|------|----------|--------|
| 前端框架 | React | 18.x | 生态成熟，社区活跃，适合快速开发 | MIT（开源免费） |
| 语言 | TypeScript | 5.x | 类型安全，代码可维护性高 | Apache 2.0（开源免费） |
| 样式 | TailwindCSS | 3.x | 快速构建UI，响应式设计 | MIT（开源免费） |
| 状态管理 | React Context | - | 轻量级，适合中小规模应用 | MIT（开源免费） |
| 路由 | React Router | 6.x | React生态标准路由库 | MIT（开源免费） |
| 后端框架 | Node.js + Express | 18.x | 高性能，易于上手 | MIT（开源免费） |
| 数据库 | MongoDB | 6.x | 文档型数据库，适合订单数据存储 | Server Side Public License（社区版免费） |
| ORM | Mongoose | 7.x | MongoDB官方ODM，简化数据操作 | MIT（开源免费） |
| 文件上传 | Multer | 1.x | Node.js文件上传中间件 | MIT（开源免费） |
| 图片处理 | Sharp | 0.32.x | 高性能图片处理库 | Apache 2.0（开源免费） |
| 支付集成 | 模拟支付 | - | 演示用，可扩展接入真实支付 | - |

### 2.1.1 技术栈免费说明

本订单系统采用的所有技术均为**开源免费**软件：

1. **前端技术**：React、TypeScript、TailwindCSS、React Router 均采用 MIT 或 Apache 2.0 开源许可证，完全免费商用
2. **后端技术**：Node.js、Express、Mongoose、Multer、Sharp 均为开源免费软件
3. **数据库**：MongoDB 社区版完全免费，适合中小型应用部署
4. **部署**：可部署在免费的云服务器或本地环境

> **注意**：如果需要使用 MongoDB Atlas（云托管服务）或其他商业云服务，可能会产生费用，但本方案支持本地部署，无需任何费用。

### 2.2 架构设计

- **架构风格**: 前后端分离，RESTful API设计
- **前端**: 单页应用(SPA)，组件化开发
- **后端**: 分层架构(Controller -> Service -> Model)

### 2.3 目录结构

```
ordersystem/
├── frontend/                    # 前端项目
│   ├── src/
│   │   ├── components/          # 公共组件
│   │   ├── pages/               # 页面组件
│   │   ├── context/             # 状态管理
│   │   ├── services/            # API服务
│   │   ├── types/               # TypeScript类型定义
│   │   └── utils/               # 工具函数
│   ├── public/
│   └── package.json
├── backend/                     # 后端项目
│   ├── src/
│   │   ├── controllers/         # 控制器
│   │   ├── services/            # 业务逻辑
│   │   ├── models/              # 数据模型
│   │   ├── routes/              # 路由定义
│   │   ├── middleware/          # 中间件
│   │   ├── utils/               # 工具函数
│   │   └── uploads/             # 上传文件存储目录
│   ├── .env                     # 环境变量
│   └── package.json
└── README.md
```

---

## 3. 数据库设计

### 3.1 用户表 (users)

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| _id | ObjectId | 用户ID | 主键 |
| username | String | 用户名 | 唯一，必填 |
| email | String | 邮箱 | 唯一，必填 |
| password | String | 密码(加密) | 必填 |
| phone | String | 手机号 | 可选 |
| createdAt | Date | 创建时间 | 自动 |
| updatedAt | Date | 更新时间 | 自动 |

### 3.2 商品表 (products)

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| _id | ObjectId | 商品ID | 主键 |
| name | String | 商品名称 | 必填 |
| description | String | 商品描述 | 可选 |
| price | Number | 价格 | 必填，>0 |
| category | String | 分类 | 必填 |
| type | String | 商品类型(milk_tea/handmade) | 必填 |
| image | String | 图片URL | 可选 |
| stock | Number | 库存数量 | 默认0 |
| status | String | 状态(active/inactive) | 默认active |
| estimatedDays | Number | 预计制作天数(手工制作商品) | 可选 |
| modificationFee | Number | 修改费用(每次修改的额外收费) | 默认0 |
| freeModificationCount | Number | 免费修改次数 | 默认0 |
| createdAt | Date | 创建时间 | 自动 |

### 3.3 订单表 (orders)

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| _id | ObjectId | 订单ID | 主键 |
| userId | ObjectId | 用户ID | 外键，必填 |
| items | Array | 订单项 | 必填 |
| items[].productId | ObjectId | 商品ID | 必填 |
| items[].quantity | Number | 数量 | 必填，>0 |
| items[].price | Number | 单价 | 必填 |
| totalAmount | Number | 订单总额 | 必填 |
| modificationAmount | Number | 修改费用总额 | 默认0 |
| modificationCount | Number | 修改次数 | 默认0 |
| status | String | 订单状态 | 必填 |
| paymentStatus | String | 支付状态 | 默认pending |
| shippingAddress | Object | 配送地址 | 可选 |
| progressImages | Array | 制作进度图片 | 可选 |
| progressImages[].url | String | 图片URL | 必填 |
| progressImages[].description | String | 图片描述 | 可选 |
| progressImages[].uploadedAt | Date | 上传时间 | 自动 |
| comments | Array | 客户评论/修改请求 | 可选 |
| comments[].userId | ObjectId | 用户ID | 必填 |
| comments[].content | String | 评论内容 | 必填 |
| comments[].type | String | 类型(comment/modification_request) | 必填 |
| comments[].status | String | 修改请求状态(pending/approved/rejected) | 可选 |
| comments[].reply | String | 管理员回复 | 可选 |
| comments[].createdAt | Date | 创建时间 | 自动 |
| createdAt | Date | 创建时间 | 自动 |
| updatedAt | Date | 更新时间 | 自动 |

### 3.4 订单状态枚举

| 状态值 | 说明 |
|--------|------|
| pending | 待支付 |
| paid | 已支付 |
| preparing | 制作中 |
| ready | 待取货/配送中 |
| completed | 已完成 |
| cancelled | 已取消 |

---

## 4. API接口设计

### 4.1 用户接口

| API路径 | HTTP方法 | 功能 | 所属文件 |
|---------|----------|------|----------|
| /api/users/register | POST | 用户注册 | users.ts |
| /api/users/login | POST | 用户登录 | users.ts |
| /api/users/profile | GET | 获取用户信息 | users.ts |
| /api/users/profile | PUT | 更新用户信息 | users.ts |

### 4.2 商品接口

| API路径 | HTTP方法 | 功能 | 所属文件 |
|---------|----------|------|----------|
| /api/products | GET | 获取商品列表 | products.ts |
| /api/products/:id | GET | 获取商品详情 | products.ts |
| /api/products | POST | 创建商品(管理员) | products.ts |
| /api/products/:id | PUT | 更新商品(管理员) | products.ts |
| /api/products/:id | DELETE | 删除商品(管理员) | products.ts |

### 4.3 订单接口

| API路径 | HTTP方法 | 功能 | 所属文件 |
|---------|----------|------|----------|
| /api/orders | GET | 获取订单列表 | orders.ts |
| /api/orders/:id | GET | 获取订单详情 | orders.ts |
| /api/orders | POST | 创建订单 | orders.ts |
| /api/orders/:id/status | PUT | 更新订单状态 | orders.ts |
| /api/orders/:id/pay | PUT | 订单支付 | orders.ts |
| /api/orders/:id | DELETE | 取消订单 | orders.ts |
| /api/orders/:id/images | POST | 上传制作进度图片(管理员) | orders.ts |
| /api/orders/:id/images | GET | 获取制作进度图片列表 | orders.ts |
| /api/orders/:id/images/:imageId | DELETE | 删除进度图片(管理员) | orders.ts |
| /api/orders/:id/comments | POST | 添加评论/修改请求 | orders.ts |
| /api/orders/:id/comments | GET | 获取订单评论列表 | orders.ts |
| /api/orders/:id/comments/:commentId | PUT | 处理修改请求(管理员) | orders.ts |

---

## 5. 前端页面设计

### 5.1 页面列表

| 页面 | 路径 | 功能描述 | 权限 |
|------|------|----------|------|
| 首页 | / | 商品展示、分类导航（奶茶/手工制作分类） | 公开 |
| 商品详情 | /products/:id | 商品详情、加入购物车 | 公开 |
| 购物车 | /cart | 购物车管理 | 登录 |
| 订单列表 | /orders | 我的订单列表 | 登录 |
| 订单详情 | /orders/:id | 订单详情、进度追踪、制作进度图片查看、评论、修改请求 | 登录 |
| 用户注册 | /register | 用户注册 | 公开 |
| 用户登录 | /login | 用户登录 | 公开 |
| 个人中心 | /profile | 用户信息管理 | 登录 |
| 管理后台 | /admin | 商品管理、订单管理、进度图片上传、修改请求处理 | 管理员 |

### 5.2 组件设计

| 组件 | 功能 | 所属文件 |
|------|------|----------|
| Header | 顶部导航、搜索、购物车图标 | components/Header.tsx |
| ProductCard | 商品卡片展示 | components/ProductCard.tsx |
| CartItem | 购物车项 | components/CartItem.tsx |
| OrderItem | 订单列表项 | components/OrderItem.tsx |
| OrderStatus | 订单状态进度条 | components/OrderStatus.tsx |
| ProgressGallery | 制作进度图片展示画廊 | components/ProgressGallery.tsx |
| ImageUploader | 图片上传组件(管理员) | components/ImageUploader.tsx |
| CommentSection | 评论区组件(客户评论、修改请求) | components/CommentSection.tsx |
| ModificationRequest | 修改请求表单组件 | components/ModificationRequest.tsx |
| Loading | 加载动画 | components/Loading.tsx |
| Toast | 消息提示 | components/Toast.tsx |

---

## 6. 部署与运行

### 6.1 环境要求

- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm >= 9.0.0

### 6.2 启动命令

```bash
# 后端启动
cd backend
npm install
npm run dev

# 前端启动
cd frontend
npm install
npm start
```

### 6.3 环境变量

后端需要配置 `.env` 文件：

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ordersystem
JWT_SECRET=your-secret-key
```

---

## 7. 开发进度计划

| 阶段 | 任务 | 预估时间 |
|------|------|----------|
| 第一阶段 | 后端API开发(用户、商品、订单) | 3天 |
| 第二阶段 | 前端页面开发(首页、商品、订单) | 3天 |
| 第三阶段 | 订单进度追踪功能 | 2天 |
| 第四阶段 | 管理后台开发 | 2天 |
| 第五阶段 | 测试与优化 | 2天 |

---

## 8. 风险与注意事项

1. **数据一致性**: 订单创建时需要检查商品库存
2. **并发安全**: 库存扣减需要考虑并发场景
3. **支付安全**: 支付接口需要验证订单状态
4. **错误处理**: 完善的错误处理和日志记录
5. **用户体验**: 加载状态、错误提示、操作反馈
6. **图片存储**: 需要设置合理的文件大小限制，防止恶意上传
7. **图片安全**: 验证上传文件类型，防止上传恶意文件
8. **图片清理**: 订单完成后考虑是否保留进度图片或定期清理
9. **修改计费**: 修改费用计算需要准确，避免重复计费或漏计费
10. **修改请求审核**: 需要明确的审核流程，防止恶意修改请求
11. **费用透明**: 修改费用需要提前告知用户，避免纠纷

---

## 9. 扩展功能建议

- [ ] 集成真实支付接口(微信支付、支付宝)
- [ ] 添加优惠券/折扣功能
- [ ] 支持订单评论和评分
- [ ] 添加推送通知功能
- [ ] 支持多语言国际化

---

## 10. 多智能体协作方案

### 10.1 智能体角色分配

本项目可以利用多个专业智能体并行执行不同模块的开发任务：

| 智能体 | 职责 | 负责模块 |
|--------|------|----------|
| **backend-architect** | 后端架构设计与实现 | 用户模块、商品模块、订单模块 API |
| **frontend-architect** | 前端架构设计与实现 | 页面组件、状态管理、用户交互 |
| **ui-designer** | 用户界面设计 | 组件样式、视觉设计、用户体验 |
| **api-test-pro** | API测试验证 | 接口测试、性能测试、契约测试 |
| **performance-expert** | 性能优化 | 代码优化、数据库优化、性能调优 |
| **devops-architect** | 部署与运维 | CI/CD管道、环境配置、监控告警 |

### 10.2 多任务并行执行策略

```
┌─────────────────────────────────────────────────────────────┐
│                      订单系统开发                           │
├─────────────────────┬───────────────────────────────────────┤
│   第一阶段 (并行)    │                                       │
├─────────┬───────────┼───────────┬───────────┬───────────────┤
│ 后端API │ 前端框架   │ 数据库设计 │ 技术方案   │ 环境搭建      │
│ 设计     │ 搭建       │            │ 文档编写   │               │
├─────────┴───────────┴───────────┴───────────┴───────────────┤
│   第二阶段 (并行)    │                                       │
├─────────┬───────────┬───────────┬───────────┬───────────────┤
│ 用户模块 │ 商品模块   │ 订单模块   │ 进度追踪   │ UI组件开发    │
│ API实现  │ API实现    │ API实现    │ API实现    │               │
├─────────┴───────────┴───────────┴───────────┴───────────────┤
│   第三阶段 (并行)    │                                       │
├─────────┬───────────┬───────────────────────────────────────┤
│ 前端页面 │ API测试   │ 性能优化、安全审计、文档完善            │
│ 开发     │           │                                       │
└─────────┴───────────┴───────────────────────────────────────┘
```

### 10.3 智能体调用示例

在实际开发过程中，可以通过以下方式调用不同智能体：

1. **后端开发**：使用 `backend-architect` 设计和实现 API
2. **前端开发**：使用 `frontend-architect` 和 `ui-designer` 协作完成界面开发
3. **测试阶段**：使用 `api-test-pro` 和 `performance-expert` 进行测试和优化
4. **部署阶段**：使用 `devops-architect` 配置 CI/CD 和监控

### 10.4 协作优势

- **并行开发**：不同模块可以同时进行，缩短整体开发周期
- **专业分工**：每个智能体专注于自己的领域，保证质量
- **效率提升**：减少沟通成本，快速交付高质量代码
- **质量保障**：多维度测试和审计，确保系统稳定性
