import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Order, Product } from '../types';
import { orderAPI, productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components/Loading';
import { OrderStatus } from '../components/OrderStatus';
import { ProgressGallery } from '../components/ProgressGallery';
import { CommentSection } from '../components/CommentSection';
import { ImageUploader } from '../components/ImageUploader';

const API_URL = 'http://localhost:5002';

export const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  
  const getImageUrl = (url: string | undefined) => {
    if (!url) return undefined;
    if (url.startsWith('http')) {
      return url;
    }
    return `${API_URL}${url}`;
  };
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderData = await orderAPI.getById(id!);
        setOrder(orderData);

        const productMap: Record<string, Product> = {};
        for (const item of orderData.items) {
          const productId = typeof item.productId === 'string' ? item.productId : item.productId._id;
          try {
            const product = await productAPI.getById(productId);
            if (product) {
              productMap[productId] = product;
            }
          } catch (err) {
            console.error('获取商品失败:', err);
          }
        }
        setProducts(productMap);
      } catch (error) {
        console.error('获取订单详情失败:', error);
      }
      setLoading(false);
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const handlePay = async () => {
    if (!order) return;
    setIsPaying(true);
    try {
      const updatedOrder = await orderAPI.pay(order._id);
      setOrder(updatedOrder);
    } catch (error) {
      console.error('支付失败:', error);
    }
    setIsPaying(false);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!order) return;
    try {
      const updatedOrder = await orderAPI.updateStatus(order._id, status);
      setOrder(updatedOrder);
    } catch (error) {
      console.error('更新状态失败:', error);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!confirm('确定要取消这个订单吗？此操作不可撤销。')) return;
    try {
      const updatedOrder = await orderAPI.cancel(order._id);
      setOrder(updatedOrder);
    } catch (error: any) {
      console.error('取消订单失败:', error);
      alert(error.response?.data?.message || '取消订单失败');
    }
  };

  const handleUpdate = () => {
    const fetchOrder = async () => {
      try {
        const orderData = await orderAPI.getById(id!);
        setOrder(orderData);
      } catch (error) {
        console.error('获取订单详情失败:', error);
      }
    };
    fetchOrder();
  };

  const isAdmin = user?.role === 'admin';

  if (loading) {
    return <Loading />;
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-500">订单不存在</p>
        <Link to="/orders" className="text-orange-500">返回订单列表</Link>
      </div>
    );
  }

  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: '待支付', color: 'bg-yellow-100 text-yellow-600' },
    paid: { label: '已支付', color: 'bg-blue-100 text-blue-600' },
    preparing: { label: '制作中', color: 'bg-orange-100 text-orange-600' },
    ready: { label: '待取货', color: 'bg-green-100 text-green-600' },
    completed: { label: '已完成', color: 'bg-gray-100 text-gray-600' },
    cancelled: { label: '已取消', color: 'bg-red-100 text-red-600' },
  };

  const status = statusMap[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600' };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">订单详情</h1>
        <Link to="/orders" className="text-orange-500">返回列表</Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-gray-500">订单号: {order.orderNumber || order._id}</span>
            <p className="text-gray-400 text-sm mt-1">{order.createdAt}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${status.color}`}>
            {status.label}
          </span>
        </div>

        {order.shippingAddress && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="font-semibold mb-2">配送地址</h4>
            <p>{order.shippingAddress.name} {order.shippingAddress.phone}</p>
            <p className="text-gray-600">{order.shippingAddress.address}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">订单商品</h3>
        <div className="space-y-4">
          {order.items.map((item, index) => {
            const productId = typeof item.productId === 'string' ? item.productId : item.productId._id;
            const product = products[productId];
            const productName = typeof item.productId === 'object' ? item.productId.name : product?.name;
            const productImage = typeof item.productId === 'object' ? item.productId.image : product?.image;
            return (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  {getImageUrl(productImage) ? (
                    <img src={getImageUrl(productImage)} alt={productName || '未知商品'} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{productName || '未知商品'}</h4>
                  <p className="text-orange-500">¥{item.price}</p>
                </div>
                <div className="text-right">
                  <p>数量: {item.quantity}</p>
                  <p className="font-semibold">¥{item.price * item.quantity}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between items-center">
          <span className="text-gray-600">订单总额</span>
          <span className="text-xl font-bold text-orange-500">¥{order.totalAmount}</span>
        </div>
        {order.modificationAmount > 0 && (
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">修改费用</span>
            <span className="text-orange-500">¥{order.modificationAmount}</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <OrderStatus status={order.status} />
        
        {order.status === 'pending' && (
          <div className="text-center mt-6 flex justify-center gap-4">
            <button
              onClick={handlePay}
              disabled={isPaying}
              className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition font-semibold"
            >
              {isPaying ? '支付中...' : '立即支付'}
            </button>
            <button
              onClick={handleCancelOrder}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition font-semibold"
            >
              取消订单
            </button>
          </div>
        )}

        {isAdmin && (
          <div className="mt-6 flex justify-center space-x-4">
            {order.status === 'paid' && (
              <button
                onClick={() => handleUpdateStatus('preparing')}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
              >
                开始制作
              </button>
            )}
            {order.status === 'preparing' && (
              <button
                onClick={() => handleUpdateStatus('ready')}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                制作完成
              </button>
            )}
            {order.status === 'ready' && (
              <button
                onClick={() => handleUpdateStatus('completed')}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
              >
                完成订单
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">制作进度</h3>
        <ProgressGallery images={order.progressImages} />
      </div>

      {isAdmin && order.status !== 'completed' && order.status !== 'cancelled' && (
        <div className="mb-6">
          <ImageUploader orderId={order._id} onUpload={handleUpdate} />
        </div>
      )}

      <CommentSection
        comments={order.comments}
        orderId={order._id}
        isAdmin={isAdmin}
        onUpdate={handleUpdate}
      />
    </div>
  );
};