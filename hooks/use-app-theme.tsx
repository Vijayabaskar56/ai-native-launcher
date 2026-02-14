import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: typeof lightColors;
}

const lightColors = {
  background: '#ffffff',
  surface: '#f5f5f5',
  text: '#000000',
  textSecondary: '#666666',
  accent: '#007AFF',
  border: '#e0e0e0',
  dock: 'rgba(255, 255, 255, 0.9)',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const darkColors = {
  background: '#000000',
  surface: '#1c1c1e',
  text: '#ffffff',
  textSecondary: '#8e8e93',
  accent: '#0A84FF',
  border: '#38383a',
  dock: 'rgba(28, 28, 30, 0.9)',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(
    Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme === 'dark' ? 'dark' : 'light');
    });
    return () => subscription.remove();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
