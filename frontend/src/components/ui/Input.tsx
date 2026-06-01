import React from 'react';

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
        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
      />
    </div>
  );
};
