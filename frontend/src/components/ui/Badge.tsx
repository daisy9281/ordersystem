import React from 'react';
import { useThemeColor } from '../../utils/themeUtils';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge = ({ children, variant = 'default', className = '' }: BadgeProps) => {
  const { primaryColor, lightBgColor } = useThemeColor();
  
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: lightBgColor, color: primaryColor };
      case 'success':
        return { className: 'bg-green-100 text-green-700' };
      case 'warning':
        return { className: 'bg-yellow-100 text-yellow-700' };
      case 'danger':
        return { className: 'bg-red-100 text-red-700' };
      case 'info':
        return { className: 'bg-blue-100 text-blue-700' };
      default:
        return { className: 'bg-gray-100 text-gray-700' };
    }
  };

  const style = getVariantStyle();
  
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.className || ''} ${className}`}
      style={style.className ? undefined : { backgroundColor: style.backgroundColor, color: style.color }}
    >
      {children}
    </span>
  );
};
