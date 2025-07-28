/**
 * Tailwind Showcase Component
 * Demonstrates the integration of Tailwind CSS with design tokens
 */

import React, { useState } from 'react';
import { useTheme, ThemeToggle } from './ThemeProvider';

export function TailwindShowcase() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('colors');

  const tabs = [
    { id: 'colors', label: 'Colors' },
    { id: 'typography', label: 'Typography' },
    { id: 'spacing', label: 'Spacing' },
    { id: 'components', label: 'Components' },
    { id: 'animations', label: 'Animations' },
  ];

  return (
    <div className="container-responsive py-8">
      <div className="card-elevated p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient-primary mb-2">
              Tailwind CSS Integration
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Showcasing design tokens integration with Tailwind CSS
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'colors' && <ColorsTab />}
          {activeTab === 'typography' && <TypographyTab />}
          {activeTab === 'spacing' && <SpacingTab />}
          {activeTab === 'components' && <ComponentsTab />}
          {activeTab === 'animations' && <AnimationsTab />}
        </div>
      </div>
    </div>
  );
}

function ColorsTab() {
  const colorPalettes = [
    { name: 'Primary', prefix: 'primary' },
    { name: 'Accent', prefix: 'accent' },
    { name: 'Neutral', prefix: 'neutral' },
    { name: 'Success', prefix: 'success' },
    { name: 'Error', prefix: 'error' },
    { name: 'Warning', prefix: 'warning' },
  ];

  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold mb-4">Color Palette</h2>
      
      {colorPalettes.map((palette) => (
        <div key={palette.name} className="space-y-3">
          <h3 className="text-lg font-medium">{palette.name}</h3>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {shades.map((shade) => (
              <div key={shade} className="text-center">
                <div
                  className={`
                    w-full h-16 rounded-lg mb-2 border border-neutral-200 dark:border-neutral-700
                    bg-${palette.prefix}-${shade}
                  `}
                />
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  {shade}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Semantic Colors */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Semantic Usage</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4 border-l-4 border-success-500">
            <div className="text-success-700 dark:text-success-400 font-medium">Success</div>
            <div className="text-success-600 dark:text-success-300 text-sm">Operation completed</div>
          </div>
          <div className="card p-4 border-l-4 border-error-500">
            <div className="text-error-700 dark:text-error-400 font-medium">Error</div>
            <div className="text-error-600 dark:text-error-300 text-sm">Something went wrong</div>
          </div>
          <div className="card p-4 border-l-4 border-warning-500">
            <div className="text-warning-700 dark:text-warning-400 font-medium">Warning</div>
            <div className="text-warning-600 dark:text-warning-300 text-sm">Please be careful</div>
          </div>
          <div className="card p-4 border-l-4 border-primary-500">
            <div className="text-primary-700 dark:text-primary-400 font-medium">Info</div>
            <div className="text-primary-600 dark:text-primary-300 text-sm">Additional information</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TypographyTab() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold mb-4">Typography Scale</h2>
      
      <div className="space-y-4">
        <div className="text-9xl font-black">9XL Heading</div>
        <div className="text-8xl font-extrabold">8XL Heading</div>
        <div className="text-7xl font-bold">7XL Heading</div>
        <div className="text-6xl font-bold">6XL Heading</div>
        <div className="text-5xl font-bold">5XL Heading</div>
        <div className="text-4xl font-bold">4XL Heading</div>
        <div className="text-3xl font-bold">3XL Heading</div>
        <div className="text-2xl font-semibold">2XL Heading</div>
        <div className="text-xl font-semibold">XL Heading</div>
        <div className="text-lg font-medium">Large Text</div>
        <div className="text-base">Base Text</div>
        <div className="text-sm">Small Text</div>
        <div className="text-xs">Extra Small Text</div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Font Weights</h3>
        <div className="space-y-2">
          <div className="text-thin">Thin (100)</div>
          <div className="text-extralight">Extra Light (200)</div>
          <div className="text-light">Light (300)</div>
          <div className="text-normal">Normal (400)</div>
          <div className="text-medium">Medium (500)</div>
          <div className="text-semibold">Semibold (600)</div>
          <div className="text-bold">Bold (700)</div>
          <div className="text-extrabold">Extra Bold (800)</div>
          <div className="text-black">Black (900)</div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Text Utilities</h3>
        <div className="space-y-4">
          <div className="text-gradient-primary text-2xl font-bold">Gradient Primary Text</div>
          <div className="text-gradient-accent text-2xl font-bold">Gradient Accent Text</div>
          <div className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 p-2 rounded">
            Monospace font for code
          </div>
        </div>
      </div>
    </div>
  );
}

function SpacingTab() {
  const spacingSizes = [1, 2, 3, 4, 6, 8, 12, 16, 20, 24, 32];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold mb-4">Spacing System</h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Padding Examples</h3>
        {spacingSizes.map((size) => (
          <div key={size} className="flex items-center space-x-4">
            <div className="w-16 text-sm text-neutral-600 dark:text-neutral-400">
              p-{size}
            </div>
            <div className={`bg-primary-100 dark:bg-primary-900 p-${size} rounded`}>
              <div className="bg-primary-500 text-white text-xs px-2 py-1 rounded">
                Content
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Margin Examples</h3>
        <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
          {spacingSizes.slice(0, 6).map((size) => (
            <div key={size} className={`bg-accent-200 dark:bg-accent-800 p-2 m-${size} rounded text-xs`}>
              m-{size}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComponentsTab() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold mb-4">Component Examples</h2>
      
      {/* Buttons */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <button className="btn-primary px-4 py-2">Primary</button>
          <button className="btn-secondary px-4 py-2">Secondary</button>
          <button className="btn-accent px-4 py-2">Accent</button>
          <button className="btn-ghost px-4 py-2">Ghost</button>
          <button className="btn-danger px-4 py-2">Danger</button>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <h4 className="font-semibold mb-2">Basic Card</h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Simple card with basic styling
            </p>
          </div>
          <div className="card-hover p-4">
            <h4 className="font-semibold mb-2">Hover Card</h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Card with hover effects
            </p>
          </div>
          <div className="card-elevated p-4">
            <h4 className="font-semibold mb-2">Elevated Card</h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Card with stronger shadow
            </p>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Form Inputs</h3>
        <div className="space-y-4 max-w-md">
          <input className="input" placeholder="Basic input" />
          <input className="input-success" placeholder="Success state" />
          <input className="input-error" placeholder="Error state" />
        </div>
      </div>

      {/* Glass Effect */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Glass Morphism</h3>
        <div className="relative bg-gradient-to-r from-primary-400 to-accent-400 p-8 rounded-xl">
          <div className="glass p-6 rounded-lg">
            <h4 className="font-semibold text-white mb-2">Glass Effect</h4>
            <p className="text-white text-opacity-90 text-sm">
              Glassmorphism effect with backdrop blur
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimationsTab() {
  const [triggerAnimation, setTriggerAnimation] = useState(false);

  const animations = [
    { name: 'Fade In', class: 'animate-fade-in' },
    { name: 'Fade In Up', class: 'animate-fade-in-up' },
    { name: 'Scale In', class: 'animate-scale-in' },
    { name: 'Float', class: 'animate-float' },
    { name: 'Pulse Slow', class: 'animate-pulse-slow' },
    { name: 'Spin Slow', class: 'animate-spin-slow' },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold mb-4">Animations</h2>
      
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => setTriggerAnimation(!triggerAnimation)}
          className="btn-primary px-4 py-2"
        >
          Trigger Animations
        </button>
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          Click to see entrance animations
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {animations.map((animation, index) => (
          <div
            key={animation.name}
            className={`
              card p-6 text-center
              ${triggerAnimation ? animation.class : ''}
            `}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="w-12 h-12 bg-primary-500 rounded-full mx-auto mb-3" />
            <h4 className="font-medium">{animation.name}</h4>
            <code className="text-xs text-neutral-500 dark:text-neutral-400">
              {animation.class}
            </code>
          </div>
        ))}
      </div>

      {/* Loading States */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Loading States</h3>
        <div className="space-y-4">
          <div className="skeleton h-4 w-3/4 rounded"></div>
          <div className="skeleton h-4 w-1/2 rounded"></div>
          <div className="skeleton h-32 w-full rounded-lg"></div>
        </div>
      </div>

      {/* Interactive Elements */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Interactive Effects</h3>
        <div className="flex flex-wrap gap-4">
          <div className="interactive card p-4 cursor-pointer">
            <div className="text-sm font-medium">Hover Lift</div>
            <div className="text-xs text-neutral-500">interactive class</div>
          </div>
          <div className="interactive-scale card p-4 cursor-pointer">
            <div className="text-sm font-medium">Hover Scale</div>
            <div className="text-xs text-neutral-500">interactive-scale class</div>
          </div>
        </div>
      </div>
    </div>
  );
}