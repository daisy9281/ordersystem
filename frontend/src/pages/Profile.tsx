import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ColorPicker } from '../components/ColorPicker';

export const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { primaryColor, setPrimaryColor } = useTheme();
  const [formData, setFormData] = useState({ username: user?.username || '', phone: user?.phone || '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await authAPI.updateProfile(formData);
      setMessage('更新成功');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
      setShowUpdateForm(false);
    } catch (error) {
      console.error('更新失败:', error);
      setMessage('更新失败');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    }
    setIsUpdating(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
          <p className="text-gray-500 mt-2">{user.email}</p>
          
          <button
            onClick={() => setShowUpdateForm(!showUpdateForm)}
            className="mt-4 text-sm text-orange-500 hover:text-orange-600 underline"
          >
            {showUpdateForm ? '收起' : '修改信息'}
          </button>
        </div>

        {showUpdateForm && (
          <>
            {message && (
              <div className={`p-3 rounded-lg mb-6 text-center ${messageType === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4 mb-6">
              <Input
                label="用户名"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="请输入用户名"
              />

              <Input
                type="tel"
                label="手机号"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="请输入手机号"
              />

              <Button type="submit" disabled={isUpdating} className="w-full" size="lg">
                {isUpdating ? '更新中...' : '保存修改'}
              </Button>
            </form>
          </>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">主题设置</h3>
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-3">选择您喜欢的主题色调</p>
            <ColorPicker
              selectedColor={primaryColor}
              onChange={setPrimaryColor}
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">当前主题色</span>
            <div className="flex items-center space-x-2">
              <div
                className="w-6 h-6 rounded-full border border-gray-300"
                style={{ backgroundColor: primaryColor }}
              />
              <span className="text-sm font-medium text-gray-800">{primaryColor}</span>
            </div>
          </div>
        </div>

        <Button variant="secondary" onClick={logout} className="w-full mt-6" size="lg">
          退出登录
        </Button>
      </Card>
    </div>
  );
};