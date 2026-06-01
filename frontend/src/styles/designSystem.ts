export const colors = {
  black: '#000000',
  white: '#ffffff',
  orange: '#ff5b00',
  orangeLight: '#fff7ed',
  orangeDark: '#ea580c',
  green: '#22c55e',
  greenLight: '#f0fdf4',
  greenDark: '#16a34a',
  blue: '#3b82f6',
  blueLight: '#eff6ff',
  blueDark: '#2563eb',
  
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  red: '#ef4444',
  redLight: '#fef2f2',
  yellow: '#eab308',
  yellowLight: '#fefce8',
  purple: '#8b5cf6',
  purpleLight: '#f5f3ff',
  pink: '#ec4899',
  pinkLight: '#fdf2f8',
};

export const fonts = {
  sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  serif: "'Georgia', 'Times New Roman', serif",
  mono: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
};

export const fontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
};

export const fontWeights = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
};

export const borderRadius = {
  none: '0',
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px',
};

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

export const transitions = {
  fast: 'all 0.15s ease-in-out',
  normal: 'all 0.2s ease-in-out',
  slow: 'all 0.3s ease-in-out',
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
};

export const designTokens = {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  spacing,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
};
