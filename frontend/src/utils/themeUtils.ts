import { useTheme } from '../context/ThemeContext';

export const useThemeColor = () => {
  const { primaryColor } = useTheme();
  
  return {
    primaryColor,
    // 生成hover颜色（稍微深一点）
    hoverColor: darkenColor(primaryColor, 10),
    // 生成active颜色（更深一点）
    activeColor: darkenColor(primaryColor, 20),
    // 生成浅色背景
    lightBgColor: lightenColor(primaryColor, 80),
    // 生成边框颜色
    borderColor: darkenColor(primaryColor, 20),
  };
};

// 颜色变暗
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max((num >> 16) - amt, 0);
  const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
  const B = Math.max((num & 0x0000FF) - amt, 0);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

// 颜色变亮
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min((num >> 16) + amt, 255);
  const G = Math.min((num >> 8 & 0x00FF) + amt, 255);
  const B = Math.min((num & 0x0000FF) + amt, 255);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}