/**
 * Theme Toggle Component
 * Provides a button to switch between light and dark themes
 */

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeContext } from '../../contexts/ThemeContext';
import { Theme } from '../../styles/tokens';

interface ThemeToggleProps {
className?: string;
  showLabel?: boolean;
  variant?: 'button' | 'dropdown' | 'switch';
  size?: 'sm' | 'md' | 'lg';

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
  variant = 'button',
  size = 'md'
}) => {
  const { theme, setTheme, toggleTheme, isDark } = useThemeContext();

  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className={`
          ${sizeClasses[size]}
          inline-flex items-center justify-center
          rounded-lg border border-border
          bg-background hover:bg-muted
          text-foreground
          transition-all duration-200 ease-in-out
          hover:scale-105 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
          ${className}
        `}
        title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      >
        {isDark ? (
          <Sun size={iconSizes[size]} className="text-yellow-500" />
        ) : (
          <Moon size={iconSizes[size]} className="text-blue-600" />
        )}
        {showLabel && (
          <span className="ml-2 text-sm font-medium">
            {isDark ? 'Light' : 'Dark'}
          </span>
        )}
      </button>
    );

  if (variant === 'switch') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        {showLabel && (
          <span className="text-sm font-medium text-foreground">
            Theme
          </span>
        )}
        <button
          onClick={toggleTheme}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full
            transition-colors duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
            ${isDark ? 'bg-blue-600' : 'bg-gray-200'}
          `}
          role="switch"
          aria-checked={isDark}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full
              bg-white transition-transform duration-200 ease-in-out
              ${isDark ? 'translate-x-6' : 'translate-x-1'}
            `}
          >
            {isDark ? (
              <Moon size={12} className="text-blue-600 p-0.5" />
            ) : (
              <Sun size={12} className="text-yellow-500 p-0.5" />
            )}
          </span>
        </button>
      </div>
    );

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as Theme)}
          className={`
            ${sizeClasses[size]}
            appearance-none rounded-lg border border-border
            bg-background text-foreground
            px-3 py-2 pr-8
            focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
            transition-colors duration-200
          `}
          aria-label="Select theme"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-foreground">
          <Monitor size={iconSizes[size]} />
        </div>
      </div>
    );

  return null;
};

/**
 * Theme Toggle with System Preference Option
 */
interface ThemeToggleWithSystemProps extends ThemeToggleProps {
}
}
}
  includeSystem?: boolean;

export const ThemeToggleWithSystem: React.FC<ThemeToggleWithSystemProps> = ({
  includeSystem = true,
  className = '',
  size = 'md',
  ...props
}) => {
  const { theme, setTheme } = useThemeContext();
  const [systemTheme, setSystemTheme] = React.useState<'light' | 'dark'>('light');

  // Listen for system theme changes
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    ...(includeSystem ? [{ value: 'system', label: 'System', icon: Monitor }] : [])
  ];

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {themes.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value as Theme)}
          className={`
            inline-flex items-center justify-center
            rounded-lg px-3 py-2
            text-sm font-medium
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
            ${theme === value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
          `}
          title={`Switch to ${label.toLowerCase()} theme`}
          aria-label={`Switch to ${label.toLowerCase()} theme`}
        >
          <Icon size={iconSizes[size]} className="mr-2" />
          {label}
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
}
}}