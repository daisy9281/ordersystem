import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
}: ButtonProps) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2';
  
  const variantStyles = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 disabled:bg-gray-300',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 disabled:bg-gray-100',
    success: 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700 disabled:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 disabled:bg-gray-300',
    outline: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white active:bg-orange-600',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className} ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  );
};
