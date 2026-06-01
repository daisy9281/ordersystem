import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await authAPI.login({ password });
      login(user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '登录失败');
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">欢迎回来</h1>
          <p className="text-gray-500 mt-2">请输入密码登录</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="password"
            label="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            required
          />

          <Button type="submit" disabled={isLoading} className="w-full" size="lg">
            {isLoading ? '登录中...' : '登录'}
          </Button>
        </form>

        <div className="mt-6">
          <p className="text-center text-gray-600">
            还没有账号？ <Link to="/register" className="text-orange-500 hover:text-orange-600 font-medium">立即注册</Link>
          </p>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 text-center">
            管理员密码: admin123
          </p>
          <p className="text-xs text-gray-500 text-center mt-1">
            测试用户密码: user123
          </p>
        </div>
      </Card>
    </div>
  );
};