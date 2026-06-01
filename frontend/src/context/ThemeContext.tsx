import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ThemeContextType {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'app_primary_color';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [primaryColor, setPrimaryColorState] = useState('#ff5b00');

  useEffect(() => {
    const savedColor = localStorage.getItem(STORAGE_KEY);
    if (savedColor) {
      setPrimaryColorState(savedColor);
    }
  }, []);

  const setPrimaryColor = (color: string) => {
    setPrimaryColorState(color);
    localStorage.setItem(STORAGE_KEY, color);
  };

  return (
    <ThemeContext.Provider value={{ primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};