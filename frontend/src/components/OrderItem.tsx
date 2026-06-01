import { Order } from '../types';
import { Link } from 'react-router-dom';
import { Card, CardBody } from './ui/Card';

interface OrderItemProps {
  order: Order;
}

export const OrderItem = ({ order }: OrderItemProps) => {
  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: '待支付', color: 'bg-yellow-100 text-yellow-600' },
    paid: { label: '已支付', color: 'bg-blue-100 text-blue-600' },
    preparing: { label: '制作中', color: 'bg-orange-100 text-orange-600' },
    ready: { label: '待取货', color: 'bg-green-100 text-green-600' },
    completed: { label: '已完成', color: 'bg-gray-100 text-gray-600' },
    cancelled: { label: '已取消', color: 'bg-red-100 text-red-600' },
  };

  const status = statusMap[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600' };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
      <CardBody>
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-gray-500 text-sm">订单号: {order.orderNumber || order._id}</span>
            <p className="text-gray-400 text-xs mt-1">{formatDate(order.createdAt)}</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full ${status.color}`}>{status.label}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-gray-600 text-sm">
              {order.items.map((item, index) => (
                <span key={index}>
                  {index > 0 && ', '}
                  {item.quantity}件
                </span>
              ))}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-orange-500">¥{order.totalAmount}</p>
            {order.modificationCount > 0 && (
              <p className="text-xs text-gray-500 mt-1">修改{order.modificationCount}次</p>
            )}
          </div>
        </div>

        <Link to={`/orders/${order._id}`} className="block mt-4 text-right text-sm text-orange-500 hover:text-orange-600 transition">
          查看详情 →
        </Link>
      </CardBody>
    </Card>
  );
};