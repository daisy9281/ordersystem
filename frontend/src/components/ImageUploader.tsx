import { useState, useRef } from 'react';
import { orderAPI } from '../services/api';

interface ImageUploaderProps {
  orderId: string;
  onUpload?: () => void;
}

export const ImageUploader = ({ orderId, onUpload }: ImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await orderAPI.uploadImage(orderId, file, description);
      setDescription('');
      onUpload?.();
    } catch (error) {
      console.error('上传失败:', error);
    }
    setIsUploading(false);
    event.target.value = '';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">上传制作进度图片</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">图片描述（可选）</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="输入图片描述..."
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition flex items-center justify-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{isUploading ? '上传中...' : '选择图片上传'}</span>
      </button>
    </div>
  );
};