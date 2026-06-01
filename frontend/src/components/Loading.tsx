import { useThemeColor } from '../utils/themeUtils';

export const Loading = () => {
  const { primaryColor } = useThemeColor();
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderBottomColor: primaryColor }}></div>
    </div>
  );
};