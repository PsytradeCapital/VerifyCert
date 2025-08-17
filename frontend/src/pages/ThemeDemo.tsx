/**
 * Theme Demo Page
 * Demonstrates the dark theme implementation and all theme-aware components
 */

import React from 'react';
import { useThemeContext } from '../contexts/ThemeContext';
import { ThemeToggle, ThemeToggleWithSystem } from '../components/ui/ThemeToggle';
import { designTokens } from '../styles/tokens';

const ThemeDemo: React.FC = () => {
  const { theme, tokens, isDark, isLight } = useThemeContext();

  const colorPalettes = [
    { name: 'Primary', colors: designTokens.colors.primary },
    { name: 'Accent', colors: designTokens.colors.accent },
    { name: 'Neutral', colors: designTokens.colors.neutral },
    { name: 'Success', colors: designTokens.colors.success },
    { name: 'Error', colors: designTokens.colors.error },
    { name: 'Warning', colors: designTokens.colors.warning },
    { name: 'Info', colors: designTokens.colors.info },
  ];

  const componentExamples = [
    {
      name: 'Buttons',
      component: (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
              Primary Button
            </button>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity">
              Secondary Button
            </button>
            <button className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity">
              Accent Button
            </button>
            <button className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors">
              Outline Button
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-success text-success-foreground rounded-lg hover:opacity-90 transition-opacity">
              Success Button
            </button>
            <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity">
              Destructive Button
            </button>
            <button className="px-4 py-2 bg-warning text-warning-foreground rounded-lg hover:opacity-90 transition-opacity">
              Warning Button
            </button>
            <button className="px-4 py-2 bg-info text-info-foreground rounded-lg hover:opacity-90 transition-opacity">
              Info Button
            </button>
          </div>
        </div>
      ),
    },
    {
      name: 'Cards',
      component: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-theme-md">
            <h3 className="text-lg font-semibold mb-2">Default Card</h3>
            <p className="text-muted-foreground">This is a default card with theme-aware styling.</p>
          </div>
          <div className="bg-primary/10 text-foreground p-6 rounded-xl border border-primary/20 shadow-theme-md">
            <h3 className="text-lg font-semibold mb-2 text-primary">Primary Card</h3>
            <p className="text-muted-foreground">This card uses primary color theming.</p>
          </div>
          <div className="bg-accent/10 text-foreground p-6 rounded-xl border border-accent/20 shadow-theme-md">
            <h3 className="text-lg font-semibold mb-2 text-accent">Accent Card</h3>
            <p className="text-muted-foreground">This card uses accent color theming.</p>
          </div>
        </div>
      ),
    },
    {
      name: 'Form Elements',
      component: (
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Text Input
            </label>
            <input
              type="text"
              placeholder="Enter some text..."
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Dropdown
            </label>
            <select className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors">
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Textarea
            </label>
            <textarea
              rows={3}
              placeholder="Enter a longer message..."
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors resize-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="checkbox"
              className="h-4 w-4 text-primary focus:ring-ring border-border rounded"
            />
            <label htmlFor="checkbox" className="text-sm text-foreground">
              I agree to the terms and conditions
            </label>
          </div>
        </div>
      ),
    },
    {
      name: 'Alerts',
      component: (
        <div className="space-y-4">
          <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-success">Success Alert</h3>
                <p className="mt-1 text-sm text-success/80">Your changes have been saved successfully.</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-destructive" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-destructive">Error Alert</h3>
                <p className="mt-1 text-sm text-destructive/80">There was an error processing your request.</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-warning">Warning Alert</h3>
                <p className="mt-1 text-sm text-warning/80">Please review your information before proceeding.</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-info" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-info">Info Alert</h3>
                <p className="mt-1 text-sm text-info/80">Here's some helpful information for you.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Theme Demo</h1>
          <p className="text-muted-foreground mb-6">
            Explore the theme system with light and dark mode support. Current theme: <span className="font-semibold text-primary">{theme}</span>
          </p>
          
          {/* Theme Controls */}
          <div className="flex flex-wrap gap-4 p-6 bg-card border border-border rounded-xl shadow-theme-md">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Basic Toggle</h3>
              <ThemeToggle />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Switch Style</h3>
              <ThemeToggle variant="switch" showLabel />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">With System Option</h3>
              <ThemeToggleWithSystem size="default" />
            </div>
          </div>
        </div>

        {/* Theme Information */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-card border border-border rounded-lg shadow-theme-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Theme</h3>
            <p className="text-lg font-semibold text-foreground">{theme}</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg shadow-theme-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Is Dark Mode</h3>
            <p className="text-lg font-semibold text-foreground">{isDark ? 'Yes' : 'No'}</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg shadow-theme-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Is Light Mode</h3>
            <p className="text-lg font-semibold text-foreground">{isLight ? 'Yes' : 'No'}</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg shadow-theme-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">CSS Variables</h3>
            <p className="text-lg font-semibold text-foreground">Active</p>
          </div>
        </div>

        {/* Color Palettes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Color Palettes</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {colorPalettes.map((palette) => (
              <div key={palette.name} className="bg-card border border-border rounded-xl p-6 shadow-theme-md">
                <h3 className="text-lg font-semibold text-foreground mb-4">{palette.name}</h3>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(palette.colors).map(([shade, color]) => (
                    <div key={shade} className="text-center">
                      <div
                        className="w-full h-12 rounded-lg border border-border shadow-theme-sm mb-2"
                        style={{ backgroundColor: color }}
                      />
                      <div className="text-xs text-muted-foreground">{shade}</div>
                      <div className="text-xs font-mono text-muted-foreground">{color}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Component Examples */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-foreground">Component Examples</h2>
          {componentExamples.map((example) => (
            <div key={example.name} className="bg-card border border-border rounded-xl p-6 shadow-theme-md">
              <h3 className="text-lg font-semibold text-foreground mb-4">{example.name}</h3>
              {example.component}
            </div>
          ))}
        </div>

        {/* CSS Variables Display */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Active CSS Variables</h2>
          <div className="bg-card border border-border rounded-xl p-6 shadow-theme-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(tokens.cssVariables).map(([variable, value]) => (
                <div key={variable} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <code className="text-sm font-mono text-foreground">{variable}</code>
                  <span className="text-sm text-muted-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeDemo;