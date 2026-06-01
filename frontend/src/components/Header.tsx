import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Header = () => {
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-orange-500">
            订单系统
          </Link>
          
          {/* 桌面端导航 */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-orange-500 transition">首页</Link>
            <Link to="/orders" className="text-gray-600 hover:text-orange-500 transition">我的订单</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-gray-600 hover:text-orange-500 transition">管理后台</Link>
            )}
          </nav>

          {/* 移动端汉堡菜单按钮 */}
          <button
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {getItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-gray-600 hidden sm:block">{user.username}</span>
                <Link to="/profile" className="p-2 hover:bg-gray-100 rounded-full transition">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-orange-500 transition">登录</Link>
                <Link to="/register" className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition">注册</Link>
              </div>
            )}
          </div>
        </div>

        {/* 移动端菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <nav className="flex flex-col space-y-2">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-orange-500 hover:bg-gray-50 px-4 py-2 rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                首页
              </Link>
              <Link 
                to="/orders" 
                className="text-gray-600 hover:text-orange-500 hover:bg-gray-50 px-4 py-2 rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                我的订单
              </Link>
              {user?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="text-gray-600 hover:text-orange-500 hover:bg-gray-50 px-4 py-2 rounded-lg transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  管理后台
                </Link>
              )}
              {user && (
                <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="text-gray-600 hover:text-red-500 hover:bg-gray-50 px-4 py-2 rounded-lg transition text-left"
                >
                  退出登录
                </button>
              )}
              {!user && (
                <>
                  <Link 
                    to="/login" 
                    className="text-gray-600 hover:text-orange-500 hover:bg-gray-50 px-4 py-2 rounded-lg transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    登录
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    注册
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
