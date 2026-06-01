import React from 'react';
import { useThemeColor } from '../../utils/themeUtils';

interface TabProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Tab = ({ children, active = false, onClick, className = '' }: TabProps) => {
  const { primaryColor } = useThemeColor();
  
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium text-sm transition-all duration-200 border-b-2 ${
        active
          ? 'border-transparent text-gray-700'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      } ${className}`}
      style={active ? { borderBottomColor: primaryColor, color: primaryColor } : undefined}
    >
      {children}
    </button>
  );
};

interface TabContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const TabContainer = ({ children, className = '' }: TabContainerProps) => {
  return (
    <div className={`flex border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};
