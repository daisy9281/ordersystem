import { CartItem as CartItemType } from '../types';
import { useCart } from '../context/CartContext';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-md">
      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
        {item.product.image ? (
          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover rounded-lg" />
        ) : (
          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold">{item.product.name}</h3>
        <span className="text-orange-500 font-bold">¥{item.product.price}</span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
          className="w-8 h-8 bg-gray-100 rounded-full hover:bg-gray-200 transition flex items-center justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <span className="w-8 text-center">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
          className="w-8 h-8 bg-gray-100 rounded-full hover:bg-gray-200 transition flex items-center justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      <button
        onClick={() => removeItem(item.productId)}
        className="text-red-500 hover:text-red-600 transition"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};