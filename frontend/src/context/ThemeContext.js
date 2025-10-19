import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
    }
  }, []);

  // Save theme preference
  const toggleTheme = () => {
    setIsDark(prev => {
      const newTheme = !prev;
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      return newTheme;
    });
  };

  // Color palette based on theme
  const colors = {
    light: {
      bg: '#f9fafb',
      bgSecondary: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      borderDark: '#d1d5db',
      hover: '#f3f4f6',
      primary: '#2563eb',
      primaryLight: '#dbeafe',
      success: '#10b981',
      error: '#dc2626',
      warning: '#f59e0b'
    },
    dark: {
      bg: '#0f172a',
      bgSecondary: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#334155',
      borderDark: '#475569',
      hover: '#1e293b',
      primary: '#3b82f6',
      primaryLight: '#1e3a8a',
      success: '#059669',
      error: '#dc2626',
      warning: '#f59e0b'
    }
  };

  const theme = isDark ? colors.dark : colors.light;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;