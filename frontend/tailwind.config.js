const { designTokens } = require('./src/styles/tokens.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    // Override default theme with our design tokens
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: 'rgb(255 255 255)',
      black: 'rgb(0 0 0)',
      
      // Theme-aware colors using CSS custom properties
      background: 'var(--color-background)',
      foreground: 'var(--color-foreground)',
      card: 'var(--color-card)',
      'card-foreground': 'var(--color-card-foreground)',
      popover: 'var(--color-popover)',
      'popover-foreground': 'var(--color-popover-foreground)',
      muted: 'var(--color-muted)',
      'muted-foreground': 'var(--color-muted-foreground)',
      border: 'var(--color-border)',
      input: 'var(--color-input)',
      ring: 'var(--color-ring)',
      
      // Semantic colors with theme support
      primary: {
        DEFAULT: 'var(--color-primary)',
        foreground: 'var(--color-primary-foreground)',
        ...designTokens.colors.primary,
      },
      secondary: {
        DEFAULT: 'var(--color-secondary)',
        foreground: 'var(--color-secondary-foreground)',
      },
      accent: {
        DEFAULT: 'var(--color-accent)',
        foreground: 'var(--color-accent-foreground)',
        ...designTokens.colors.accent,
      },
      destructive: {
        DEFAULT: 'var(--color-destructive)',
        foreground: 'var(--color-destructive-foreground)',
      },
      success: {
        DEFAULT: 'var(--color-success)',
        foreground: 'var(--color-success-foreground)',
        ...designTokens.colors.success,
      },
      warning: {
        DEFAULT: 'var(--color-warning)',
        foreground: 'var(--color-warning-foreground)',
        ...designTokens.colors.warning,
      },
      info: {
        DEFAULT: 'var(--color-info)',
        foreground: 'var(--color-info-foreground)',
        ...designTokens.colors.info,
      },
      error: {
        ...designTokens.colors.error,
      },
      
      // Full color palettes for both themes
      ...designTokens.colors,
    },
    fontFamily: {
      ...designTokens.typography.fontFamily,
    },
    fontSize: {
      ...designTokens.typography.fontSize,
    },
    fontWeight: {
      ...designTokens.typography.fontWeight,
    },
    letterSpacing: {
      ...designTokens.typography.letterSpacing,
    },
    spacing: {
      ...designTokens.spacing,
    },
    borderRadius: {
      ...designTokens.borderRadius,
    },
    boxShadow: {
      // Theme-aware shadows using CSS custom properties
      sm: 'var(--shadow-sm)',
      DEFAULT: 'var(--shadow-md)',
      md: 'var(--shadow-md)',
      lg: 'var(--shadow-lg)',
      xl: 'var(--shadow-xl)',
      '2xl': 'var(--shadow-2xl)',
      inner: 'var(--shadow-inner)',
      none: '0 0 #0000',
      
      // Enhanced custom shadows for premium feel
      'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      'glow': '0 0 20px rgba(59, 130, 246, 0.15)',
      'glow-accent': '0 0 20px rgba(234, 179, 8, 0.15)',
      'glow-success': '0 0 20px rgba(34, 197, 94, 0.15)',
      'glow-error': '0 0 20px rgba(239, 68, 68, 0.15)',
      'glow-warning': '0 0 20px rgba(245, 158, 11, 0.15)',
      
      // Full shadow palettes for both themes
      ...designTokens.boxShadow,
    },
    zIndex: {
      ...designTokens.zIndex,
    },
    extend: {
      // Enhanced responsive breakpoints
      screens: {
        'xs': '475px',
        '3xl': '1920px',
        // Custom breakpoints for specific use cases
        'mobile': { 'max': '767px' },
        'tablet': { 'min': '768px', 'max': '1023px' },
        'desktop': { 'min': '1024px' },
        'touch': { 'max': '1023px' }, // Devices that are likely touch-enabled
        'hover': { 'raw': '(hover: hover)' }, // Devices that support hover
        'no-hover': { 'raw': '(hover: none)' }, // Touch-only devices
        'portrait': { 'raw': '(orientation: portrait)' },
        'landscape': { 'raw': '(orientation: landscape)' },
        'print': { 'raw': 'print' },
        'dark': { 'raw': '(prefers-color-scheme: dark)' },
        'light': { 'raw': '(prefers-color-scheme: light)' },
        'motion': { 'raw': '(prefers-reduced-motion: no-preference)' },
        'no-motion': { 'raw': '(prefers-reduced-motion: reduce)' },
        'high-contrast': { 'raw': '(prefers-contrast: high)' },
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      // Enhanced color palette with CSS custom properties
      colors: {
        // Surface colors for better layering
        surface: {
          50: 'var(--color-neutral-50)',
          100: 'var(--color-neutral-100)',
          200: 'var(--color-neutral-200)',
          300: 'var(--color-neutral-300)',
        },
        // Border colors
        border: {
          light: 'var(--color-neutral-200)',
          DEFAULT: 'var(--color-neutral-300)',
          dark: 'var(--color-neutral-400)',
        },
        // Text colors
        text: {
          primary: 'var(--color-neutral-900)',
          secondary: 'var(--color-neutral-600)',
          tertiary: 'var(--color-neutral-500)',
          inverse: 'var(--color-neutral-50)',
        },
      },
      animation: {
        // Smooth entrance animations
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'fade-in-down': 'fadeInDown 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
        
        // Loading animations
        'spin-slow': 'spin 2s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
        
        // Interactive animations
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        
        // Validation animations
        'error-shake': 'errorShake 0.5s ease-in-out',
        'error-pulse': 'errorPulse 0.6s ease-in-out',
        'slide-in-error': 'slideInError 0.3s ease-out',
        'error-glow': 'errorGlow 1s ease-in-out infinite',
        'success-bounce': 'successBounce 0.6s ease-out',
        'fade-in-success': 'fadeInSuccess 0.4s ease-out',
        'slide-in-success': 'slideInSuccess 0.3s ease-out',
        'success-glow': 'successGlow 1s ease-in-out infinite',
        'warning-wiggle': 'warningWiggle 0.5s ease-in-out',
        'fade-in-warning': 'fadeInWarning 0.3s ease-out',
        'slide-in-warning': 'slideInWarning 0.3s ease-out',
        'warning-glow': 'warningGlow 1s ease-in-out infinite',
        'icon-pop-in': 'iconPopIn 0.4s ease-out',
        'icon-slide-in': 'iconSlideIn 0.3s ease-out',
        'label-float-up': 'labelFloatUp 0.2s ease-out forwards',
        'label-float-down': 'labelFloatDown 0.2s ease-out forwards',
        'progress-fill': 'progressFill 0.5s ease-out forwards',
        'focus-ripple': 'focusRipple 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        skeleton: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        },
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' }
        },
        // Validation keyframes
        errorShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' }
        },
        errorPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' }
        },
        slideInError: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        errorGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' },
          '50%': { boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)' }
        },
        successBounce: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'scale(1)' },
          '40%, 43%': { transform: 'scale(1.1)' },
          '70%': { transform: 'scale(1.05)' },
          '90%': { transform: 'scale(1.02)' }
        },
        fadeInSuccess: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideInSuccess: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        successGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0)' },
          '50%': { boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.1)' }
        },
        warningWiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-1deg)' },
          '75%': { transform: 'rotate(1deg)' }
        },
        fadeInWarning: {
          '0%': { transform: 'translateY(5px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideInWarning: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        warningGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245, 158, 11, 0)' },
          '50%': { boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.1)' }
        },
        iconPopIn: {
          '0%': { transform: 'scale(0) rotate(180deg)', opacity: '0' },
          '50%': { transform: 'scale(1.2) rotate(90deg)', opacity: '0.8' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' }
        },
        iconSlideIn: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        labelFloatUp: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0.7' },
          '100%': { transform: 'translateY(-1.5rem) scale(0.85)', opacity: '1' }
        },
        labelFloatDown: {
          '0%': { transform: 'translateY(-1.5rem) scale(0.85)', opacity: '1' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '0.7' }
        },
        progressFill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width, 100%)' }
        },
        focusRipple: {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(1)', opacity: '0' }
        },
        skeleton: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        },
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' }
        }
      },
      // Gradient configurations
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))',
        'gradient-accent': 'linear-gradient(135deg, var(--color-accent-500), var(--color-accent-600))',
      },
      // Custom backdrop blur
      backdropBlur: {
        xs: '2px',
      },
      // Custom transitions
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'colors-shadow': 'color, background-color, border-color, text-decoration-color, fill, stroke, box-shadow',
      },
      transitionDuration: {
        ...designTokens.animation.duration,
      },
      transitionTimingFunction: {
        ...designTokens.animation.easing,
      },
    },
  },
  plugins: [
    // Add custom utilities
    function({ addUtilities, addComponents, theme }) {
      // Custom utilities
      const newUtilities = {
        // Text utilities
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.text-pretty': {
          'text-wrap': 'pretty',
        },
        // Focus utilities with design token integration
        '.focus-ring': {
          '&:focus': {
            outline: '2px solid transparent',
            'outline-offset': '2px',
            'box-shadow': `0 0 0 2px var(--color-primary-500)`,
          },
        },
        '.focus-ring-accent': {
          '&:focus': {
            outline: '2px solid transparent',
            'outline-offset': '2px',
            'box-shadow': `0 0 0 2px var(--color-accent-500)`,
          },
        },
        '.focus-ring-error': {
          '&:focus': {
            outline: '2px solid transparent',
            'outline-offset': '2px',
            'box-shadow': `0 0 0 2px var(--color-error-500)`,
          },
        },
        // Enhanced scrollbar utilities
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'var(--color-neutral-100)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'var(--color-neutral-300)',
            'border-radius': theme('borderRadius.full'),
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'var(--color-neutral-400)',
          },
        },
        '.scrollbar-none': {
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        // Glass morphism effects
        '.glass': {
          background: 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          background: 'rgba(0, 0, 0, 0.1)',
          'backdrop-filter': 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        // Skeleton loading effect
        '.skeleton': {
          background: 'linear-gradient(90deg, var(--color-neutral-200) 25%, var(--color-neutral-100) 50%, var(--color-neutral-200) 75%)',
          'background-size': '200% 100%',
          animation: 'skeleton 1.5s ease-in-out infinite',
        },
        // Enhanced safe area utilities for mobile
        '.safe-top': {
          'padding-top': 'env(safe-area-inset-top)',
        },
        '.safe-bottom': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
        '.safe-left': {
          'padding-left': 'env(safe-area-inset-left)',
        },
        '.safe-right': {
          'padding-right': 'env(safe-area-inset-right)',
        },
        '.safe-area': {
          'padding-top': 'env(safe-area-inset-top)',
          'padding-right': 'env(safe-area-inset-right)',
          'padding-bottom': 'env(safe-area-inset-bottom)',
          'padding-left': 'env(safe-area-inset-left)',
        },
        '.safe-area-x': {
          'padding-left': 'env(safe-area-inset-left)',
          'padding-right': 'env(safe-area-inset-right)',
        },
        '.safe-area-y': {
          'padding-top': 'env(safe-area-inset-top)',
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
        // Mobile-first touch targets
        '.touch-target': {
          'min-height': '44px',
          'min-width': '44px',
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'center',
        },
        '.touch-target-sm': {
          'min-height': '40px',
          'min-width': '40px',
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'center',
        },
        '.touch-target-lg': {
          'min-height': '48px',
          'min-width': '48px',
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'center',
        },
        '.touch-target-xl': {
          'min-height': '56px',
          'min-width': '56px',
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'center',
        },
        // Mobile-optimized spacing
        '.mobile-padding': {
          'padding': '1rem',
          '@media (min-width: 640px)': {
            'padding': '1.5rem',
          },
          '@media (min-width: 1024px)': {
            'padding': '2rem',
          },
        },
        '.mobile-padding-x': {
          'padding-left': '1rem',
          'padding-right': '1rem',
          '@media (min-width: 640px)': {
            'padding-left': '1.5rem',
            'padding-right': '1.5rem',
          },
          '@media (min-width: 1024px)': {
            'padding-left': '2rem',
            'padding-right': '2rem',
          },
        },
        '.mobile-padding-y': {
          'padding-top': '1rem',
          'padding-bottom': '1rem',
          '@media (min-width: 640px)': {
            'padding-top': '1.5rem',
            'padding-bottom': '1.5rem',
          },
          '@media (min-width: 1024px)': {
            'padding-top': '2rem',
            'padding-bottom': '2rem',
          },
        },
        // Mobile-optimized text sizes
        '.text-mobile-xs': {
          'font-size': '0.75rem',
          'line-height': '1.125rem',
        },
        '.text-mobile-sm': {
          'font-size': '0.875rem',
          'line-height': '1.375rem',
        },
        '.text-mobile-base': {
          'font-size': '1rem',
          'line-height': '1.5rem',
        },
        '.text-mobile-lg': {
          'font-size': '1.125rem',
          'line-height': '1.625rem',
        },
        '.text-mobile-xl': {
          'font-size': '1.25rem',
          'line-height': '1.75rem',
        },
        // Responsive visibility utilities
        '.mobile-only': {
          '@media (min-width: 768px)': {
            'display': 'none',
          },
        },
        '.tablet-only': {
          'display': 'none',
          '@media (min-width: 768px) and (max-width: 1023px)': {
            'display': 'block',
          },
        },
        '.desktop-only': {
          'display': 'none',
          '@media (min-width: 1024px)': {
            'display': 'block',
          },
        },
        '.touch-only': {
          'display': 'none',
          '@media (max-width: 1023px)': {
            'display': 'block',
          },
        },
        '.hover-only': {
          'display': 'none',
          '@media (hover: hover)': {
            'display': 'block',
          },
        },
        // Interaction states
        '.interactive': {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        '.interactive-scale': {
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.02)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
      }

      // Custom components
      const newComponents = {
        // Button base styles
        '.btn-base': {
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          'border-radius': theme('borderRadius.lg'),
          'font-weight': theme('fontWeight.medium'),
          transition: 'all 0.2s ease-in-out',
          'text-decoration': 'none',
          border: 'none',
          cursor: 'pointer',
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed',
          },
        },
        // Card base styles
        '.card-base': {
          'background-color': theme('colors.white'),
          'border-radius': theme('borderRadius.xl'),
          'box-shadow': theme('boxShadow.soft'),
          border: `1px solid ${theme('colors.neutral.200')}`,
          transition: 'all 0.2s ease-in-out',
        },
        // Input base styles
        '.input-base': {
          width: '100%',
          'border-radius': theme('borderRadius.lg'),
          border: `1px solid ${theme('colors.neutral.300')}`,
          padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
          'font-size': theme('fontSize.sm[0]'),
          transition: 'all 0.2s ease-in-out',
          '&:focus': {
            outline: 'none',
            'border-color': 'var(--color-primary-500)',
            'box-shadow': `0 0 0 3px var(--color-primary-500)`,
          },
          '&::placeholder': {
            color: theme('colors.neutral.400'),
          },
        },
      }

      addUtilities(newUtilities)
      addComponents(newComponents)
    },
  ],
}