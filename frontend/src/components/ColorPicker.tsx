import { useState } from 'react';

export interface ColorPickerProps {
  selectedColor: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ selectedColor, onChange }: ColorPickerProps) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customColor, setCustomColor] = useState('#ff5b00');

  const presetColors = [
    { name: '黑色', value: '#000000' },
    { name: '白色', value: '#ffffff', border: 'border-gray-300' },
    { name: '橙色', value: '#ff5b00' },
    { name: '绿色', value: '#22c55e' },
    { name: '蓝色', value: '#3b82f6' },
  ];

  const handleColorSelect = (color: string) => {
    onChange(color);
    setShowCustomInput(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
  };

  const handleCustomColorApply = () => {
    onChange(customColor);
  };

  return (
    <div className="flex flex-col space-y-3">
      <label className="text-sm font-medium text-gray-700">选择色调</label>
      
      <div className="flex flex-wrap gap-3">
        {presetColors.map((color) => (
          <button
            key={color.value}
            onClick={() => handleColorSelect(color.value)}
            className={`
              relative w-10 h-10 rounded-full transition-all duration-200
              ${color.border || ''}
              ${selectedColor === color.value 
                ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' 
                : 'hover:scale-105'}
            `}
            style={{ backgroundColor: color.value }}
            title={color.name}
          >
            {selectedColor === color.value && (
              <span className={`absolute inset-0 flex items-center justify-center ${color.value === '#ffffff' ? 'text-gray-800' : 'text-white'}`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </button>
        ))}

        <button
          onClick={() => setShowCustomInput(!showCustomInput)}
          className={`
            relative w-10 h-10 rounded-full transition-all duration-200
            border-2 border-dashed border-gray-300
            ${showCustomInput ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105 hover:border-gray-400'}
          `}
          title="自定义颜色"
        >
          <span className="absolute inset-0 flex items-center justify-center text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </span>
        </button>
      </div>

      <div className="flex items-center space-x-3">
        {presetColors.map((color) => (
          <span
            key={color.value}
            className={`text-xs cursor-pointer transition-colors ${selectedColor === color.value ? 'font-semibold text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleColorSelect(color.value)}
          >
            {color.name}
          </span>
        ))}
        <span className={`text-xs cursor-pointer transition-colors ${showCustomInput ? 'font-semibold text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
          自定义
        </span>
      </div>

      {showCustomInput && (
        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
          <input
            type="color"
            value={customColor}
            onChange={handleCustomColorChange}
            className="w-12 h-12 rounded-lg cursor-pointer border-0"
          />
          <input
            type="text"
            value={customColor}
            onChange={handleCustomColorChange}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="#000000"
          />
          <button
            onClick={handleCustomColorApply}
            className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
          >
            应用
          </button>
        </div>
      )}
    </div>
  );
};
