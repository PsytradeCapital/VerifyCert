/**
 * Theme Context Tests
 * Tests for theme switching functionality and context integration
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, useThemeContext } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ui/ThemeToggle';

// Test component that uses theme context
const TestComponent: React.FC = () => {
  const { theme, isDark, isLight, toggleTheme } = useThemeContext();
  
  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <div data-testid="is-dark">{isDark.toString()}</div>
      <div data-testid="is-light">{isLight.toString()}</div>
      <button data-testid="toggle-theme" onClick={toggleTheme}>
        Toggle Theme
      </button>
    </div>
  );
};

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock matchMedia
const mockMatchMedia = jest.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(), // deprecated
  removeListener: jest.fn(), // deprecated
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

describe('Theme Context', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockMatchMedia.mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  it('should provide default light theme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
    expect(screen.getByTestId('is-light')).toHaveTextContent('true');
  });

  it('should toggle theme when toggle function is called', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId('toggle-theme');
    
    // Initially light
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    
    // Toggle to dark
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
      expect(screen.getByTestId('is-light')).toHaveTextContent('false');
    });

    // Toggle back to light
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
      expect(screen.getByTestId('is-light')).toHaveTextContent('true');
    });
  });

  it('should persist theme preference in localStorage', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId('toggle-theme');
    
    // Toggle to dark
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('verifycert-theme', 'dark');
    });
  });

  it('should load theme from localStorage on initialization', () => {
    mockLocalStorage.getItem.mockReturnValue('dark');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
  });

  it('should apply theme to document element', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId('toggle-theme');
    
    // Toggle to dark
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    // Toggle back to light
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBeNull();
    });
  });

  it('should throw error when useThemeContext is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useThemeContext must be used within a ThemeProvider');
    
    consoleSpy.mockRestore();
  });
});

describe('ThemeToggle Component', () => {
  it('should render theme toggle button', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('aria-label', 'Switch to dark theme');
  });

  it('should toggle theme when clicked', async () => {
    render(
      <ThemeProvider>
        <div>
          <ThemeToggle />
          <TestComponent />
        </div>
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button');
    
    // Initially light
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    
    // Click toggle
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });
  });

  it('should show correct icon for current theme', async () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button');
    
    // Initially should show moon icon (for switching to dark)
    expect(toggleButton).toHaveAttribute('aria-label', 'Switch to dark theme');
    
    // Click to switch to dark
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(toggleButton).toHaveAttribute('aria-label', 'Switch to light theme');
    });
  });

  it('should render switch variant correctly', () => {
    render(
      <ThemeProvider>
        <ThemeToggle variant="switch" showLabel />
      </ThemeProvider>
    );

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
    expect(screen.getByText('Theme')).toBeInTheDocument();
  });
});