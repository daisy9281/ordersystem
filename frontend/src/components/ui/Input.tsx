import React from 'react';
import { useThemeColor } from '../../utils/themeUtils';

export type InputType = 'text' | 'email' | 'password' | 'tel' | 'number';

interface InputProps {
  type?: InputType;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export const Input = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  className = '',
  required = false,
  disabled = false,
}: InputProps) => {
  const { primaryColor } = useThemeColor();
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full p-3 border border-gray-300 rounded-lg transition-all duration-200 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
        style={{
          ':focus': {
            outline: 'none',
            boxShadow: `0 0 0 2px ${primaryColor}`,
            borderColor: 'transparent',
          },
        } as React.CSSProperties}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = `0 0 0 2px ${primaryColor}`;
          e.currentTarget.style.borderColor = 'transparent';
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = '';
          e.currentTarget.style.borderColor = '';
        }}
      />
    </div>
  );
};
