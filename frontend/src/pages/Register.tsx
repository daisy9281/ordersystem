import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await authAPI.register(formData);
      login(user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '注册失败');
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">创建账户</h1>
          <p className="text-gray-500 mt-2">开始您的旅程</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="用户名"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="请输入用户名"
            required
          />

          <Input
            type="password"
            label="密码"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="请输入密码"
            required
          />

          <Button type="submit" disabled={isLoading} className="w-full" size="lg">
            {isLoading ? '注册中...' : '注册'}
          </Button>
        </form>

        <div className="mt-6">
          <p className="text-center text-gray-600">
            已有账号？ <Link to="/login" className="text-orange-500 hover:text-orange-600 font-medium">立即登录</Link>
          </p>
        </div>
      </Card>
    </div>
  );
};