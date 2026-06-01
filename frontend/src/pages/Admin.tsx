import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Order, Product } from '../types';
import { orderAPI, productAPI } from '../services/api';
import { Loading } from '../components/Loading';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tab, TabContainer } from '../components/ui/Tab';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { ColorPicker } from '../components/ColorPicker';

export const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    type: '',
    stock: 0,
    estimatedDays: 0,
    modificationFee: 0,
    freeModificationCount: 1
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryCreated, setCategoryCreated] = useState(false);
  const [showNewType, setShowNewType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [typeCreated, setTypeCreated] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteOrderConfirm, setDeleteOrderConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [ordersData, productsData] = await Promise.all([
          orderAPI.getAllAdmin(),
          productAPI.getAll()
        ]);
        setOrders(ordersData);
        setProducts(productsData);
      } catch (error) {
        console.error('获取数据失败:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return <Loading />;
  }

  const handleAddProduct = async () => {
    setIsSubmitting(true);
    setFormError('');

    if (!newProduct.name.trim()) {
      setFormError('请输入商品名称');
      setIsSubmitting(false);
      return;
    }

    if (newProduct.price <= 0) {
      setFormError('请输入有效的价格');
      setIsSubmitting(false);
      return;
    }

    if (!newProduct.category.trim()) {
      setFormError('请输入商品销售热度');
      setIsSubmitting(false);
      return;
    }

    try {
      const productData = {
        ...newProduct,
        type: typeMapping[newProduct.type] || newProduct.type
      };
      await productAPI.create(productData, selectedImage || undefined);
      const productsData = await productAPI.getAll();
      setProducts(productsData);
      setShowAddProduct(false);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        category: '',
        type: '',
        stock: 0,
        estimatedDays: 0,
        modificationFee: 0,
        freeModificationCount: 1
      });
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error: any) {
      console.error('添加商品失败:', error);
      setFormError(error.response?.data?.message || '添加商品失败');
    }
    setIsSubmitting(false);
  };

  const handleCategoryChange = (value: string) => {
    if (value === '__new__') {
      setShowNewCategory(true);
      setNewCategoryName('');
      setCategoryCreated(false);
      setNewProduct({ ...newProduct, category: '' });
    } else {
      setShowNewCategory(false);
      setCategoryCreated(false);
      setNewProduct({ ...newProduct, category: value });
    }
  };

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      setNewProduct({ ...newProduct, category: newCategoryName.trim() });
    }
  };

  const handleFinishCreateCategory = () => {
    if (newCategoryName.trim()) {
      setNewProduct({ ...newProduct, category: newCategoryName.trim() });
      setCategoryCreated(true);
    }
  };

  const existingCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const fixedTypes = ['奶茶', '手工制作', '饮品', '甜点', '小吃', '其他'];
  const existingTypes = Array.from(new Set(products.map(p => p.type).filter(Boolean)));
  const availableTypes = [...new Set([...fixedTypes, ...existingTypes])];
  const typeMapping: Record<string, string> = {
    '奶茶': 'milk_tea',
    '手工制作': 'handmade',
    '饮品': 'drinks',
    '甜点': 'dessert',
    '小吃': 'snacks',
    '其他': 'other'
  };

  const handleTypeChange = (value: string) => {
    if (value === '__new__') {
      setShowNewType(true);
      setNewTypeName('');
      setTypeCreated(false);
      setNewProduct({ ...newProduct, type: '' });
    } else {
      setShowNewType(false);
      setTypeCreated(false);
      setNewProduct({ ...newProduct, type: value });
    }
  };

  const handleCreateType = () => {
    if (newTypeName.trim()) {
      setNewProduct({ ...newProduct, type: newTypeName.trim() });
    }
  };

  const handleFinishCreateType = () => {
    if (newTypeName.trim()) {
      setNewProduct({ ...newProduct, type: newTypeName.trim() });
      setTypeCreated(true);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setDeleteConfirm(productId);
  };

  const confirmDeleteProduct = async () => {
    if (!deleteConfirm) return;

    try {
      await productAPI.delete(deleteConfirm);
      setProducts(products.filter(p => p._id !== deleteConfirm));
    } catch (error) {
      console.error('删除商品失败:', error);
      alert('删除商品失败');
    }
    setDeleteConfirm(null);
  };

  const handleDeleteOrder = (orderId: string) => {
    setDeleteOrderConfirm(orderId);
  };

  const confirmDeleteOrder = async () => {
    if (!deleteOrderConfirm) return;

    try {
      await orderAPI.deleteAdmin(deleteOrderConfirm);
      setOrders(orders.filter(o => o._id !== deleteOrderConfirm));
    } catch (error: any) {
      console.error('删除订单失败:', error);
      alert(error.response?.data?.message || '删除订单失败');
    }
    setDeleteOrderConfirm(null);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      const ordersData = await orderAPI.getAllAdmin();
      setOrders(ordersData);
      alert('订单状态更新成功');
    } catch (error) {
      console.error('更新订单状态失败:', error);
      alert('更新订单状态失败');
    }
  };

  const statusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' }> = {
    pending: { label: '待支付', variant: 'warning' },
    paid: { label: '已支付', variant: 'info' },
    preparing: { label: '制作中', variant: 'info' },
    ready: { label: '待取货', variant: 'success' },
    completed: { label: '已完成', variant: 'default' },
    cancelled: { label: '已取消', variant: 'danger' },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">管理后台</h1>
        <p className="text-gray-500">欢迎, {user.username}</p>
      </div>

      <TabContainer className="mb-6">
        <Tab active={activeTab === 'orders'} onClick={() => setActiveTab('orders')}>
          订单管理
        </Tab>
        <Tab active={activeTab === 'products'} onClick={() => setActiveTab('products')}>
          商品管理
        </Tab>
      </TabContainer>

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardBody>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">订单号: {order.orderNumber || order._id}</p>
                    <Badge variant={statusMap[order.status]?.variant || 'default'}>
                      {statusMap[order.status]?.label || order.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => navigate(`/orders/${order._id}`)}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      查看详情
                    </Button>
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="pending">待支付</option>
                      <option value="paid">已支付</option>
                      <option value="preparing">制作中</option>
                      <option value="ready">待取货</option>
                      <option value="completed">已完成</option>
                      <option value="cancelled">已取消</option>
                    </select>
                    {deleteOrderConfirm === order._id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">确认删除?</span>
                        <Button variant="danger" size="sm" onClick={confirmDeleteOrder}>
                          确定
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => setDeleteOrderConfirm(null)}>
                          取消
                        </Button>
                      </div>
                    ) : (
                      <Button variant="danger" size="sm" onClick={() => handleDeleteOrder(order._id)}>
                        删除
                      </Button>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  订单金额: ¥{order.totalAmount}
                  {order.modificationAmount > 0 && (
                    <span className="ml-2">修改费: ¥{order.modificationAmount}</span>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  创建时间: {new Date(order.createdAt).toLocaleString()}
                </div>
              </CardBody>
            </Card>
          ))}

          {orders.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-gray-500">暂无订单</p>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <>
          <div className="mb-6">
            <Button onClick={() => setShowAddProduct(true)}>
              添加商品
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card key={product._id}>
                <CardBody>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="default">
                      {product.type}
                    </Badge>
                    <span className="text-sm text-gray-500">库存: {product.stock}</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-orange-500">¥{product.price}</span>
                    {deleteConfirm === product._id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">确认删除?</span>
                        <Button variant="danger" size="sm" onClick={confirmDeleteProduct}>
                          确定
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => setDeleteConfirm(null)}>
                          取消
                        </Button>
                      </div>
                    ) : (
                      <Button variant="danger" size="sm" onClick={() => handleDeleteProduct(product._id)}>
                        删除
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {products.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-gray-500">暂无商品</p>
            </Card>
          )}
        </>
      )}

      <Modal isOpen={showAddProduct} onClose={() => setShowAddProduct(false)} title="添加商品">
        <div className="space-y-4">
          {formError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-center">
              {formError}
            </div>
          )}
          <Input
            label="商品名称"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            placeholder="请输入商品名称"
            required
          />
          <Input
            label="商品描述"
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            placeholder="请输入商品描述"
            required
          />
          <Input
            type="number"
            label="价格"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
            placeholder="请输入价格"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">商品图片</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition cursor-pointer"
              onClick={() => document.getElementById('product-image-upload')?.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="预览" className="max-h-40 mx-auto rounded-lg" />
              ) : (
                <>
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500">点击上传图片</p>
                  <p className="text-xs text-gray-400 mt-1">支持 JPEG、PNG 格式</p>
                </>
              )}
              <input
                id="product-image-upload"
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedImage(file);
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setImagePreview(event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
            {selectedImage && (
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className="mt-2 text-sm text-red-500 hover:text-red-700"
              >
                移除图片
              </button>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">销售热度</label>
            {showNewCategory ? (
              <div className="flex gap-2">
                {categoryCreated ? (
                  <div className="flex-1 p-3 border border-green-500 rounded-lg bg-green-50 text-green-700">
                    {newProduct.category}
                    <button
                      onClick={() => setCategoryCreated(false)}
                      className="ml-2 text-sm text-green-600 hover:text-green-800"
                    >
                      编辑
                    </button>
                  </div>
                ) : (
                  <>
                    <Input
                      value={newCategoryName || newProduct.category}
                      onChange={(e) => {
                        setNewCategoryName(e.target.value);
                        setNewProduct({ ...newProduct, category: e.target.value });
                      }}
                      placeholder="请输入新销售热度"
                      className="flex-1"
                    />
                    <Button onClick={handleFinishCreateCategory} size="sm">
                      完成
                    </Button>
                    <Button variant="secondary" onClick={() => {
                      setShowNewCategory(false);
                      setNewCategoryName('');
                      setCategoryCreated(false);
                    }} size="sm">
                      取消
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <select
                value={newProduct.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">选择销售热度</option>
                {existingCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__new__">+ 新建销售热度</option>
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">类型</label>
            {showNewType ? (
              <div className="flex gap-2">
                {typeCreated ? (
                  <div className="flex-1 p-3 border border-green-500 rounded-lg bg-green-50 text-green-700">
                    {newProduct.type}
                    <button
                      onClick={() => setTypeCreated(false)}
                      className="ml-2 text-sm text-green-600 hover:text-green-800"
                    >
                      编辑
                    </button>
                  </div>
                ) : (
                  <>
                    <Input
                      value={newTypeName || newProduct.type}
                      onChange={(e) => {
                        setNewTypeName(e.target.value);
                        setNewProduct({ ...newProduct, type: e.target.value });
                      }}
                      placeholder="请输入新类型名称"
                      className="flex-1"
                    />
                    <Button onClick={handleFinishCreateType} size="sm">
                      完成
                    </Button>
                    <Button variant="secondary" onClick={() => {
                      setShowNewType(false);
                      setNewTypeName('');
                      setTypeCreated(false);
                    }} size="sm">
                      取消
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <select
                value={newProduct.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">选择类型</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
                <option value="__new__">+ 新建类型</option>
              </select>
            )}
          </div>
          <Input
            type="number"
            label="库存"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
            placeholder="请输入库存数量"
          />
          <Input
            type="number"
            label="预计天数"
            value={newProduct.estimatedDays}
            onChange={(e) => setNewProduct({ ...newProduct, estimatedDays: Number(e.target.value) })}
            placeholder="请输入预计制作天数"
          />
          <Input
            type="number"
            label="修改费用"
            value={newProduct.modificationFee}
            onChange={(e) => setNewProduct({ ...newProduct, modificationFee: Number(e.target.value) })}
            placeholder="请输入修改费用"
          />
          <Button onClick={handleAddProduct} disabled={isSubmitting} className="w-full">
            {isSubmitting ? '添加中...' : '添加商品'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
