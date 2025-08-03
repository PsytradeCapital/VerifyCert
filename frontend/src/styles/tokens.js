/**
 * Design Tokens (JavaScript version)
 * Central configuration for all design values used throughout the application
 * This file is used by Tailwind CSS configuration
 */

const designTokens = {
  // Light theme colors (default)
  colors: {
    light: {
      // Primary brand colors - Professional blue palette (WCAG AA compliant)
      primary: {
        50: '#ffffff',  // Changed to pure white for better contrast on primary-500
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#2563eb',  // Changed from #3b82f6 to #2563eb for better contrast with white text
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        950: '#172554'
      },
      
      // Accent colors - Gold for trust and premium feel
      accent: {
        50: '#fefce8',
        100: '#fef9c3',
        200: '#fef08a',
        300: '#fde047',
        400: '#facc15',
        500: '#eab308',
        600: '#ca8a04',
        700: '#a16207',
        800: '#854d0e',
        900: '#713f12',
        950: '#422006'
      },
      
      // Neutral colors - Clean grays (WCAG AA compliant)
      neutral: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#6b7280',  // Changed from #9ca3af to #6b7280 for better contrast as placeholder text
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
        950: '#030712'
      },
      
      // Semantic colors (WCAG AA compliant)
      success: {
        50: '#ffffff',  // Changed to pure white for better contrast on success-500
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#16a34a',  // Changed from #22c55e to #16a34a for better contrast with white text
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d'
      },
      
      error: {
        50: '#ffffff',  // Changed to pure white for better contrast on error-500
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#dc2626',  // Changed from #ef4444 to #dc2626 for better contrast with white text
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d'
      },
      
      warning: {
        50: '#ffffff',  // Changed to pure white for better contrast on warning-500
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#d97706',  // Changed from #f59e0b to #d97706 for better contrast with white text
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f'
      },
      
      info: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a'
      },

      // Surface colors for light theme
      surface: {
        background: '#ffffff',
        foreground: '#111827',
        card: '#ffffff',
        cardForeground: '#111827',
        popover: '#ffffff',
        popoverForeground: '#111827',
        muted: '#f9fafb',
        mutedForeground: '#6b7280',
        border: '#e5e7eb',
        input: '#ffffff',
        ring: '#3b82f6'
      }
    },

    // Dark theme colors
    dark: {
      // Primary brand colors - Adjusted for dark theme (WCAG AA compliant)
      primary: {
        50: '#000000',  // Changed to pure black for better contrast on primary-500
        100: '#1e3a8a',
        200: '#1e40af',
        300: '#1d4ed8',
        400: '#2563eb',
        500: '#3b82f6',
        600: '#60a5fa',
        700: '#93c5fd',
        800: '#bfdbfe',
        900: '#dbeafe',
        950: '#eff6ff'
      },
      
      // Accent colors - Adjusted for dark theme
      accent: {
        50: '#422006',
        100: '#713f12',
        200: '#854d0e',
        300: '#a16207',
        400: '#ca8a04',
        500: '#eab308',
        600: '#facc15',
        700: '#fde047',
        800: '#fef08a',
        900: '#fef9c3',
        950: '#fefce8'
      },
      
      // Neutral colors - Inverted for dark theme (WCAG AA compliant)
      neutral: {
        50: '#030712',
        100: '#111827',
        200: '#1f2937',
        300: '#374151',
        400: '#9ca3af',  // Lighter for better contrast as placeholder text in dark theme
        500: '#9ca3af',  // Lighter for better contrast as muted text in dark theme
        600: '#9ca3af',
        700: '#d1d5db',
        800: '#e5e7eb',
        900: '#f3f4f6',
        950: '#f9fafb'
      },
      
      // Semantic colors - Adjusted for dark theme
      success: {
        50: '#14532d',
        100: '#166534',
        200: '#15803d',
        300: '#16a34a',
        400: '#22c55e',
        500: '#4ade80',
        600: '#86efac',
        700: '#bbf7d0',
        800: '#dcfce7',
        900: '#f0fdf4'
      },
      
      error: {
        50: '#000000',  // Changed to pure black for better contrast on error-500
        100: '#991b1b',
        200: '#b91c1c',
        300: '#dc2626',
        400: '#ef4444',
        500: '#f87171',
        600: '#fca5a5',
        700: '#fecaca',
        800: '#fee2e2',
        900: '#fef2f2'
      },
      
      warning: {
        50: '#78350f',
        100: '#92400e',
        200: '#b45309',
        300: '#d97706',
        400: '#f59e0b',
        500: '#fbbf24',
        600: '#fcd34d',
        700: '#fde68a',
        800: '#fef3c7',
        900: '#fffbeb'
      },
      
      info: {
        50: '#1e3a8a',
        100: '#1e40af',
        200: '#1d4ed8',
        300: '#2563eb',
        400: '#3b82f6',
        500: '#60a5fa',
        600: '#93c5fd',
        700: '#bfdbfe',
        800: '#dbeafe',
        900: '#eff6ff'
      },

      // Surface colors for dark theme
      surface: {
        background: '#0f172a',
        foreground: '#f1f5f9',
        card: '#1e293b',
        cardForeground: '#f1f5f9',
        popover: '#1e293b',
        popoverForeground: '#f1f5f9',
        muted: '#334155',
        mutedForeground: '#94a3b8',
        border: '#334155',
        input: '#1e293b',
        ring: '#60a5fa'
      }
    },

    // Backward compatibility - default to light theme
    primary: {
      50: '#ffffff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#2563eb',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554'
    },
    
    accent: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308',
      600: '#ca8a04',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12',
      950: '#422006'
    },
    
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712'
    },
    
    success: {
      50: '#ffffff',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#16a34a',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d'
    },
    
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    },
    
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },
    
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    }
  },
  
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',   // 2px
    1: '0.25rem',      // 4px
    1.5: '0.375rem',   // 6px
    2: '0.5rem',       // 8px
    2.5: '0.625rem',   // 10px
    3: '0.75rem',      // 12px
    3.5: '0.875rem',   // 14px
    4: '1rem',         // 16px
    5: '1.25rem',      // 20px
    6: '1.5rem',       // 24px
    7: '1.75rem',      // 28px
    8: '2rem',         // 32px
    9: '2.25rem',      // 36px
    10: '2.5rem',      // 40px
    11: '2.75rem',     // 44px
    12: '3rem',        // 48px
    14: '3.5rem',      // 56px
    16: '4rem',        // 64px
    20: '5rem',        // 80px
    24: '6rem',        // 96px
    28: '7rem',        // 112px
    32: '8rem',        // 128px
    36: '9rem',        // 144px
    40: '10rem',       // 160px
    44: '11rem',       // 176px
    48: '12rem',       // 192px
    52: '13rem',       // 208px
    56: '14rem',       // 224px
    60: '15rem',       // 240px
    64: '16rem',       // 256px
    72: '18rem',       // 288px
    80: '20rem',       // 320px
    96: '24rem'        // 384px
  },
  
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      display: ['Inter', 'system-ui', 'sans-serif']
    },
    
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
      base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
      lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
      xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
      '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
      '5xl': ['3rem', { lineHeight: '1' }],         // 48px
      '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px
      '7xl': ['4.5rem', { lineHeight: '1' }],       // 72px
      '8xl': ['6rem', { lineHeight: '1' }],         // 96px
      '9xl': ['8rem', { lineHeight: '1' }]          // 128px
    },
    
    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900'
    },
    
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    }
  },
  
  borderRadius: {
    none: '0',
    sm: '0.125rem',    // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem',    // 6px
    lg: '0.5rem',      // 8px
    xl: '0.75rem',     // 12px
    '2xl': '1rem',     // 16px
    '3xl': '1.5rem',   // 24px
    full: '9999px'
  },
  
  boxShadow: {
    light: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      none: '0 0 #0000'
    },
    dark: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.6)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.3)',
      none: '0 0 #0000',
      // Additional dark theme shadows with subtle highlights
      glow: '0 0 20px rgb(59 130 246 / 0.15)',
      glowLg: '0 0 40px rgb(59 130 246 / 0.2)'
    },
    // Backward compatibility - default to light theme
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000'
  },
  
  animation: {
    duration: {
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms'
    },
    
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },
  
  breakpoints: {
    xs: '475px',    // Extra small devices (large phones)
    sm: '640px',    // Small devices (tablets)
    md: '768px',    // Medium devices (small laptops)
    lg: '1024px',   // Large devices (desktops)
    xl: '1280px',   // Extra large devices (large desktops)
    '2xl': '1536px', // 2X large devices (larger desktops)
    '3xl': '1920px'  // 3X large devices (ultra-wide screens)
  },
  
  zIndex: {
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    auto: 'auto',
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    modalBackdrop: '1040',
    modal: '1050',
    popover: '1060',
    tooltip: '1070'
  },

  // Mobile-specific design tokens
  mobile: {
    // Touch target sizes (minimum 44px for accessibility)
    touchTarget: {
      xs: '2.5rem',   // 40px
      sm: '2.75rem',  // 44px (recommended minimum)
      md: '3rem',     // 48px
      lg: '3.5rem',   // 56px
      xl: '4rem'      // 64px
    },
    
    // Safe area insets for modern mobile devices
    safeArea: {
      top: 'env(safe-area-inset-top)',
      right: 'env(safe-area-inset-right)',
      bottom: 'env(safe-area-inset-bottom)',
      left: 'env(safe-area-inset-left)'
    },
    
    // Mobile-optimized spacing
    spacing: {
      xs: '0.5rem',   // 8px
      sm: '0.75rem',  // 12px
      md: '1rem',     // 16px
      lg: '1.5rem',   // 24px
      xl: '2rem'      // 32px
    },
    
    // Mobile typography scale
    typography: {
      xs: ['0.75rem', { lineHeight: '1.125rem' }],  // 12px/18px
      sm: ['0.875rem', { lineHeight: '1.375rem' }], // 14px/22px
      base: ['1rem', { lineHeight: '1.5rem' }],     // 16px/24px
      lg: ['1.125rem', { lineHeight: '1.625rem' }], // 18px/26px
      xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px/28px
      '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px/32px
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }] // 30px/36px
    }
  },

  // Theme-specific utilities
  themes: {
    light: {
      name: 'light',
      colors: 'light',
      shadows: 'light'
    },
    dark: {
      name: 'dark',
      colors: 'dark',
      shadows: 'dark'
    }
  },

  // CSS custom properties for theme switching
  cssVariables: {
    light: {
      '--color-background': '#ffffff',
      '--color-foreground': '#111827',
      '--color-card': '#ffffff',
      '--color-card-foreground': '#111827',
      '--color-popover': '#ffffff',
      '--color-popover-foreground': '#111827',
      '--color-primary': '#3b82f6',
      '--color-primary-foreground': '#ffffff',
      '--color-secondary': '#f3f4f6',
      '--color-secondary-foreground': '#111827',
      '--color-muted': '#f9fafb',
      '--color-muted-foreground': '#6b7280',
      '--color-accent': '#eab308',
      '--color-accent-foreground': '#111827',
      '--color-destructive': '#ef4444',
      '--color-destructive-foreground': '#ffffff',
      '--color-border': '#e5e7eb',
      '--color-input': '#ffffff',
      '--color-ring': '#3b82f6',
      '--shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
    },
    dark: {
      '--color-background': '#0f172a',
      '--color-foreground': '#f1f5f9',
      '--color-card': '#1e293b',
      '--color-card-foreground': '#f1f5f9',
      '--color-popover': '#1e293b',
      '--color-popover-foreground': '#f1f5f9',
      '--color-primary': '#60a5fa',
      '--color-primary-foreground': '#0f172a',
      '--color-secondary': '#334155',
      '--color-secondary-foreground': '#f1f5f9',
      '--color-muted': '#334155',
      '--color-muted-foreground': '#94a3b8',
      '--color-accent': '#facc15',
      '--color-accent-foreground': '#0f172a',
      '--color-destructive': '#f87171',
      '--color-destructive-foreground': '#0f172a',
      '--color-border': '#334155',
      '--color-input': '#1e293b',
      '--color-ring': '#60a5fa',
      '--shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
      '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)'
    }
  }
};

module.exports = { designTokens };