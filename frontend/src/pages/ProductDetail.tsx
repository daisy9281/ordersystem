import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components/Loading';
import { useThemeColor } from '../utils/themeUtils';
import { ImageViewer } from '../components/ImageViewer';

const API_URL = 'http://localhost:5002';

export const ProductDetail = () => {
  const { primaryColor, hoverColor } = useThemeColor();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showImageViewer, setShowImageViewer] = useState(false);
  
  const getImageUrl = (url: string | undefined) => {
    if (!url) return undefined;
    if (url.startsWith('http')) {
      return url;
    }
    return `${API_URL}${url}`;
  };
  
  const imageUrl = product ? getImageUrl(product.image) : undefined;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productAPI.getById(id!);
        setProduct(data);
      } catch (error) {
        console.error('获取商品详情失败:', error);
      }
      setLoading(false);
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-500">商品不存在</p>
        <Link to="/" style={{ color: primaryColor }}>返回首页</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center relative">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={product.name} 
              className="w-full h-full object-cover rounded-lg cursor-pointer" 
              onClick={() => setShowImageViewer(true)}
            />
          ) : (
            <svg className="w-32 h-32 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
          {imageUrl && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
              点击查看大图
            </div>
          )}
        </div>
        
        <ImageViewer 
          isOpen={showImageViewer} 
          onClose={() => setShowImageViewer(false)} 
          imageUrl={imageUrl!} 
          alt={product.name}
        />

        <div>
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
              {product.type}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{product.category}</span>
          </div>

          <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>

          <div className="flex items-baseline space-x-2 mb-6">
            <span className="text-3xl font-bold" style={{ color: primaryColor }}>¥{product.price}</span>
            {product.modificationFee > 0 && (
              <span className="text-sm text-gray-500">修改费: ¥{product.modificationFee}/次</span>
            )}
          </div>

          {product.estimatedDays && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-blue-600">预计制作时间: {product.estimatedDays} 天</p>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <span className="text-gray-600">库存: {product.stock} 件</span>
            {product.freeModificationCount > 0 && (
              <span className="text-sm text-gray-500">免费修改{x}{product.freeModificationCount}次</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full py-4 rounded-lg font-semibold transition flex items-center justify-center space-x-2 ${
              product.stock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'text-white'
            }`}
            style={product.stock === 0 ? undefined : { backgroundColor: primaryColor }}
            onMouseEnter={(e) => {
              if (product.stock !== 0) {
                e.currentTarget.style.backgroundColor = hoverColor;
              }
            }}
            onMouseLeave={(e) => {
              if (product.stock !== 0) {
                e.currentTarget.style.backgroundColor = primaryColor;
              }
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>{product.stock === 0 ? '暂时缺货' : '加入购物车'}</span>
          </button>

          {!user && (
            <p className="text-center text-gray-500 text-sm mt-4">
              <Link to="/login" style={{ color: primaryColor }}>登录</Link> 后可下单购买
            </p>
          )}
        </div>
      </div>
    </div>
  );
};