import { useState, useEffect } from 'react';
import { Product } from '../types';
import { productAPI } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { Loading } from '../components/Loading';
import { useThemeColor } from '../utils/themeUtils';

export const Home = () => {
  const { primaryColor, hoverColor } = useThemeColor();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeType, setActiveType] = useState<string>('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productAPI.getAll();
        setAllProducts(data);
        setProducts(data);
      } catch (error) {
        console.error('获取商品失败:', error);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = allProducts;

    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    if (activeType !== 'all') {
      filtered = filtered.filter(p => p.type === activeType);
    }

    setProducts(filtered);
  }, [activeCategory, activeType, allProducts]);

  if (loading) {
    return <Loading />;
  }

  const existingCategories = Array.from(new Set(allProducts.map(p => p.category).filter(Boolean)));
  const categories = [
    { id: 'all', label: '全部' },
    ...existingCategories.map(cat => ({ id: cat, label: cat })),
  ];

  const existingTypes = Array.from(new Set(allProducts.map(p => p.type).filter(Boolean)));
  const types = [
    { id: 'all', label: '全部' },
    ...existingTypes.map(t => ({ id: t, label: t })),
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="rounded-lg p-8 text-white mb-8" style={{ background: `linear-gradient(to right, ${primaryColor}, ${hoverColor})` }}>
        <h1 className="text-3xl font-bold mb-2">欢迎来到订单系统</h1>
        <p className="opacity-90">精选商品，品质保证</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex space-x-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full transition ${
                activeCategory === cat.id
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={activeCategory === cat.id ? { backgroundColor: primaryColor } : undefined}
              onMouseEnter={(e) => {
                if (activeCategory === cat.id) {
                  e.currentTarget.style.backgroundColor = hoverColor;
                }
              }}
              onMouseLeave={(e) => {
                if (activeCategory === cat.id) {
                  e.currentTarget.style.backgroundColor = primaryColor;
                }
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
        
        <div className="flex space-x-2">
          {types.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveType(type.id)}
              className={`px-4 py-2 rounded-full transition ${
                activeType === type.id
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={activeType === type.id ? { backgroundColor: primaryColor } : undefined}
              onMouseEnter={(e) => {
                if (activeType === type.id) {
                  e.currentTarget.style.backgroundColor = hoverColor;
                }
              }}
              onMouseLeave={(e) => {
                if (activeType === type.id) {
                  e.currentTarget.style.backgroundColor = primaryColor;
                }
              }}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无商品</p>
        </div>
      )}
    </div>
  );
};