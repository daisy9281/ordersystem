import { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Card, CardBody } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useThemeColor } from '../utils/themeUtils';
import { ImageViewer } from './ImageViewer';

const API_URL = 'http://localhost:5002';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const { primaryColor } = useThemeColor();
  const [showImageViewer, setShowImageViewer] = useState(false);
  
  const getImageUrl = (url: string | undefined) => {
    if (!url) return undefined;
    if (url.startsWith('http')) {
      return url;
    }
    return `${API_URL}${url}`;
  };

  const imageUrl = getImageUrl(product.image);

  return (
    <Card hover className="overflow-hidden">
      <div className="h-48 bg-gray-50 flex items-center justify-center relative">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 cursor-pointer" 
            onClick={() => setShowImageViewer(true)}
          />
        ) : (
          <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">缺货</span>
          </div>
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
      <CardBody className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="default">
            {product.type}
          </Badge>
          {product.estimatedDays && (
            <span className="text-xs text-gray-500">预计{product.estimatedDays}天</span>
          )}
        </div>
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold" style={{ color: primaryColor }}>¥{product.price}</span>
            {product.modificationFee > 0 && (
              <span className="text-xs text-gray-400 ml-2">修改费 ¥{product.modificationFee}</span>
            )}
          </div>
          <Button 
            size="sm"
            onClick={() => addItem(product)}
            disabled={product.stock === 0}
            variant={product.stock === 0 ? 'secondary' : 'primary'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>{product.stock === 0 ? '缺货' : '加入购物车'}</span>
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};
