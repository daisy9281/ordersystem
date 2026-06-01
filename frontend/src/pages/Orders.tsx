import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order } from '../types';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { OrderItem } from '../components/OrderItem';
import { Loading } from '../components/Loading';
import { Card } from '../components/ui/Card';

export const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const data = await orderAPI.getAll();
        setOrders(data);
      } catch (error) {
        console.error('获取订单失败:', error);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">我的订单</h1>
        <p className="text-sm text-gray-500">共 {orders.length} 个订单</p>
      </div>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <p className="text-gray-500 mb-2">暂无订单</p>
          <p className="text-gray-400 text-sm">快去选购心仪的商品吧</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderItem key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};