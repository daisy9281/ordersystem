import React from 'react';
import { useThemeColor } from '../../utils/themeUtils';

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
  const { primaryColor, hoverColor, activeColor } = useThemeColor();
  
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2';
  
  const variantStyles = {
    primary: 'text-white disabled:bg-gray-300',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 disabled:bg-gray-100',
    success: 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700 disabled:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 disabled:bg-gray-300',
    outline: 'border-2',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const getStyle = () => {
    if (variant === 'primary') {
      return { 
        backgroundColor: primaryColor,
        ':hover': { backgroundColor: hoverColor },
        ':active': { backgroundColor: activeColor },
      };
    } else if (variant === 'outline') {
      return { 
        borderColor: primaryColor, 
        color: primaryColor, 
        backgroundColor: 'transparent',
        ':hover': { backgroundColor: primaryColor, color: 'white' },
        ':active': { backgroundColor: activeColor },
      };
    }
    return undefined;
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className} ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      style={{
        backgroundColor: variant === 'primary' ? primaryColor : undefined,
        borderColor: variant === 'outline' ? primaryColor : undefined,
        color: variant === 'primary' ? 'white' : variant === 'outline' ? primaryColor : undefined,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          if (variant === 'primary') {
            e.currentTarget.style.backgroundColor = hoverColor;
          } else if (variant === 'outline') {
            e.currentTarget.style.backgroundColor = primaryColor;
            e.currentTarget.style.color = 'white';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          if (variant === 'primary') {
            e.currentTarget.style.backgroundColor = primaryColor;
          } else if (variant === 'outline') {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = primaryColor;
          }
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          if (variant === 'primary' || variant === 'outline') {
            e.currentTarget.style.backgroundColor = activeColor;
          }
        }
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          if (variant === 'primary') {
            e.currentTarget.style.backgroundColor = hoverColor;
          } else if (variant === 'outline') {
            e.currentTarget.style.backgroundColor = primaryColor;
            e.currentTarget.style.color = 'white';
          }
        }
      }}
    >
      {children}
    </button>
  );
};
