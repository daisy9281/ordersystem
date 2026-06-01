import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CartItem } from '../components/CartItem';
import { orderAPI } from '../services/api';

export const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, getTotal, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [address, setAddress] = useState({ name: '', phone: '', address: '' });
  const [errorMessage, setErrorMessage] = useState('');

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true;
    return /^1[3-9]\d{9}$/.test(phone);
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('登录已过期，请重新登录');
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }, 2000);
      return;
    }

    if (items.length === 0) return;

    if (address.phone && !validatePhone(address.phone)) {
      setErrorMessage('请输入有效的手机号码（11位数字，以1开头）');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const data: any = { items: orderItems };
      if (address.name && address.phone && address.address) {
        data.shippingAddress = address;
      }

      const order = await orderAPI.create(data);
      clearCart();
      navigate(`/orders/${order._id}`);
    } catch (error: any) {
      console.error('创建订单失败:', error);
      if (error.response?.status === 401) {
        setErrorMessage('登录已过期，请重新登录');
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }, 2000);
      } else {
        setErrorMessage(error.response?.data?.message || '创建订单失败');
      }
    }
    setIsSubmitting(false);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">请先登录</h3>
          <p className="text-gray-500 mb-4">登录后才能查看和管理购物车</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
          >
            去登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">购物车</h1>

      {errorMessage && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-center">
          {errorMessage}
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="text-gray-500">购物车是空的</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItem key={item.productId} item={item} />
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">订单摘要</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">商品小计</span>
                <span>¥{getTotal()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">运费</span>
                <span className="text-green-500">免费</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">订单总额</span>
                  <span className="text-xl font-bold text-orange-500">¥{getTotal()}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-3">配送地址（可选）</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  value={address.name}
                  onChange={(e) => setAddress({ ...address, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="收货人姓名"
                />
                <div>
                  <input
                    type="tel"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className={`w-full p-2 border rounded-lg ${
                      address.phone && !validatePhone(address.phone)
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="联系电话"
                  />
                  {address.phone && !validatePhone(address.phone) && (
                    <p className="text-red-500 text-xs mt-1">
                      请输入有效的手机号码（11位数字，以1开头）
                    </p>
                  )}
                </div>
                <textarea
                  value={address.address}
                  onChange={(e) => setAddress({ ...address, address: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg resize-none"
                  rows={2}
                  placeholder="详细地址"
                />
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition font-semibold"
            >
              {isSubmitting ? '提交中...' : '去结算'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
