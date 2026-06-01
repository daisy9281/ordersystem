import { useState } from 'react';

interface ModalPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title?: string;
  message: string;
  placeholder?: string;
}

export const ModalPrompt = ({ isOpen, onClose, onConfirm, title = '输入', message, placeholder = '' }: ModalPromptProps) => {
  const [value, setValue] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(value);
    setValue('');
    onClose();
  };

  const handleCancel = () => {
    setValue('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {title && (
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          </div>
        )}
        <div className="p-6">
          <p className="text-gray-700 mb-4">{message}</p>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            autoFocus
          />
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
