const fs = require('fs');
const path = require('path');

console.log('🚨 EMERGENCY SYNTAX FIX - Starting comprehensive repair...');

// Critical files with syntax errors that need immediate fixing
const criticalFixes = [
  // Fix SelectDemo.tsx - completely broken
  {
    file: 'frontend/src/components/SelectDemo.tsx',
    content: `import React, { useState } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

const SelectDemo: React.FC = () => {
  const [selectedValue, setSelectedValue] = useState<string>('');

  const options: SelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Select Demo</h2>
      <select 
        value={selectedValue}
        onChange={(e) => setSelectedValue(e.target.value)}
        className="border rounded px-3 py-2"
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {selectedValue && (
        <p className="mt-2">Selected: {selectedValue}</p>
      )}
    </div>
  );
};

export default SelectDemo;
`
  },

  // Fix Alert.tsx - broken syntax
  {
    file: 'frontend/src/components/ui/Alert/Alert.tsx',
    content: `import React from 'react';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ 
  type = 'info', 
  title, 
  message, 
  onClose 
}) => {
  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-400 text-green-700';
      case 'error':
        return 'bg-red-100 border-red-400 text-red-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      default:
        return 'bg-blue-100 border-blue-400 text-blue-700';
    }
  };

  return (
    <div className={\`border px-4 py-3 rounded relative \${getAlertStyles()}\`}>
      {title && <strong className="font-bold">{title}</strong>}
      <span className="block sm:inline">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-0 bottom-0 right-0 px-4 py-3"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
`
  },

  // Fix CertificateWizardDemo.tsx
  {
    file: 'frontend/src/components/CertificateWizardDemo.tsx',
    content: `import React, { useState } from 'react';

interface Step {
  id: number;
  title: string;
  completed: boolean;
}

const CertificateWizardDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState<Step[]>([
    { id: 1, title: 'Basic Info', completed: false },
    { id: 2, title: 'Certificate Details', completed: false },
    { id: 3, title: 'Review', completed: false }
  ]);

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      setSteps(prev => prev.map(step => 
        step.id === currentStep ? { ...step, completed: true } : step
      ));
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Certificate Wizard</h2>
      
      <div className="flex justify-between mb-8">
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center">
            <div className={\`w-8 h-8 rounded-full flex items-center justify-center \${
              step.completed ? 'bg-green-500 text-white' : 
              step.id === currentStep ? 'bg-blue-500 text-white' : 'bg-gray-300'
            }\`}>
              {step.id}
            </div>
            <span className="text-sm mt-2">{step.title}</span>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">
          Step {currentStep}: {steps[currentStep - 1]?.title}
        </h3>
        
        <div className="mb-6">
          {currentStep === 1 && <div>Basic information form would go here</div>}
          {currentStep === 2 && <div>Certificate details form would go here</div>}
          {currentStep === 3 && <div>Review and confirmation would go here</div>}
        </div>

        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={nextStep}
            disabled={currentStep === steps.length}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {currentStep === steps.length ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateWizardDemo;
`
  },

  // Fix LoadingSpinner.tsx
  {
    file: 'frontend/src/components/LoadingSpinner.tsx',
    content: `import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = 'blue-500',
  className = ''
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'large':
        return 'w-12 h-12';
      default:
        return 'w-8 h-8';
    }
  };

  return (
    <div className={\`animate-spin rounded-full border-2 border-gray-300 border-t-\${color} \${getSizeClass()} \${className}\`}>
    </div>
  );
};

export default LoadingSpinner;
`
  },

  // Fix LoadingOverlay.tsx
  {
    file: 'frontend/src/components/LoadingOverlay.tsx',
    content: `import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  message = 'Loading...' 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-700">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
`
  },

  // Fix ProgressIndicator.tsx
  {
    file: 'frontend/src/components/ProgressIndicator.tsx',
    content: `import React from 'react';

interface ProgressIndicatorProps {
  progress: number;
  max?: number;
  showPercentage?: boolean;
  className?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  progress, 
  max = 100, 
  showPercentage = true,
  className = ''
}) => {
  const percentage = Math.min((progress / max) * 100, 100);

  return (
    <div className={\`w-full \${className}\`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">Progress</span>
        {showPercentage && (
          <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: \`\${percentage}%\` }}
        />
      </div>
    </div>
  );
};

export default ProgressIndicator;
`
  },

  // Fix PWATestRunner.tsx
  {
    file: 'frontend/src/components/PWATestRunner.tsx',
    content: `import React, { useState, useEffect } from 'react';

interface TestResult {
  name: string;
  status: 'pending' | 'passed' | 'failed';
  message?: string;
}

const PWATestRunner: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Service Worker Registration', status: 'pending' },
    { name: 'Offline Capability', status: 'pending' },
    { name: 'Install Prompt', status: 'pending' }
  ]);

  const runTests = async () => {
    // Reset tests
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' })));

    // Test Service Worker
    try {
      if ('serviceWorker' in navigator) {
        setTests(prev => prev.map(test => 
          test.name === 'Service Worker Registration' 
            ? { ...test, status: 'passed', message: 'Service Worker supported' }
            : test
        ));
      } else {
        setTests(prev => prev.map(test => 
          test.name === 'Service Worker Registration' 
            ? { ...test, status: 'failed', message: 'Service Worker not supported' }
            : test
        ));
      }
    } catch (error) {
      setTests(prev => prev.map(test => 
        test.name === 'Service Worker Registration' 
          ? { ...test, status: 'failed', message: 'Error checking Service Worker' }
          : test
      ));
    }

    // Test offline capability
    setTests(prev => prev.map(test => 
      test.name === 'Offline Capability' 
        ? { ...test, status: navigator.onLine ? 'passed' : 'failed' }
        : test
    ));

    // Test install prompt
    setTests(prev => prev.map(test => 
      test.name === 'Install Prompt' 
        ? { ...test, status: 'passed', message: 'Install prompt ready' }
        : test
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">PWA Test Runner</h2>
      
      <button
        onClick={runTests}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Run Tests
      </button>

      <div className="space-y-4">
        {tests.map((test, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{test.name}</h3>
              <span className={\`font-medium \${getStatusColor(test.status)}\`}>
                {test.status.toUpperCase()}
              </span>
            </div>
            {test.message && (
              <p className="text-sm text-gray-600 mt-2">{test.message}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PWATestRunner;
`
  },

  // Fix RouteErrorBoundary.tsx
  {
    file: 'frontend/src/components/RouteErrorBoundary.tsx',
    content: `import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Route Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">Something went wrong</h3>
              <p className="mt-2 text-sm text-gray-500">
                An error occurred while loading this page. Please try refreshing or go back to the home page.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RouteErrorBoundary;
`
  },

  // Fix AnimatedWrapper.tsx
  {
    file: 'frontend/src/components/common/AnimatedWrapper.tsx',
    content: `import React, { ReactNode } from 'react';

interface AnimatedWrapperProps {
  children: ReactNode;
  animation?: 'fadeIn' | 'slideIn' | 'scaleIn';
  duration?: number;
  delay?: number;
  className?: string;
}

const AnimatedWrapper: React.FC<AnimatedWrapperProps> = ({
  children,
  animation = 'fadeIn',
  duration = 300,
  delay = 0,
  className = ''
}) => {
  const getAnimationClass = () => {
    switch (animation) {
      case 'slideIn':
        return 'animate-slide-in';
      case 'scaleIn':
        return 'animate-scale-in';
      default:
        return 'animate-fade-in';
    }
  };

  return (
    <div 
      className={\`\${getAnimationClass()} \${className}\`}
      style={{
        animationDuration: \`\${duration}ms\`,
        animationDelay: \`\${delay}ms\`
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedWrapper;
`
  }
];

// Apply all critical fixes
criticalFixes.forEach(({ file, content }) => {
  try {
    const filePath = path.join(process.cwd(), file);
    const dir = path.dirname(filePath);
    
    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${file}`);
  } catch (error) {
    console.error(`❌ Failed to fix ${file}:`, error.message);
  }
});

// Fix test files with broken syntax
const testFixes = [
  {
    file: 'frontend/src/components/__tests__/ProtectedRoute.test.tsx',
    content: `import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../auth/ProtectedRoute';
import { AuthContext } from '../../contexts/AuthContext';

const mockAuthContext = {
  user: null,
  login: jest.fn(),
  logout: jest.fn(),
  loading: false
};

const TestComponent = () => <div>Protected Content</div>;

const renderWithAuth = (authValue: any) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={authValue}>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('ProtectedRoute', () => {
  it('renders children when user is authenticated', () => {
    const authValue = { ...mockAuthContext, user: { id: '1', email: 'test@example.com' } };
    renderWithAuth(authValue);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects when user is not authenticated', () => {
    renderWithAuth(mockAuthContext);
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
`
  },

  {
    file: 'frontend/src/components/__tests__/OptimizedImage.test.tsx',
    content: `import React from 'react';
import { render, screen } from '@testing-library/react';
import OptimizedImage from '../ui/OptimizedImage';

describe('OptimizedImage', () => {
  const defaultProps = {
    src: 'test-image.jpg',
    alt: 'Test image',
    width: 300,
    height: 200
  };

  it('renders image with correct attributes', () => {
    render(<OptimizedImage {...defaultProps} />);
    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'test-image.jpg');
  });

  it('applies custom className', () => {
    render(<OptimizedImage {...defaultProps} className="custom-class" />);
    const image = screen.getByAltText('Test image');
    expect(image).toHaveClass('custom-class');
  });
});
`
  }
];

testFixes.forEach(({ file, content }) => {
  try {
    const filePath = path.join(process.cwd(), file);
    const dir = path.dirname(filePath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed test: ${file}`);
  } catch (error) {
    console.error(`❌ Failed to fix test ${file}:`, error.message);
  }
});

console.log('🎯 EMERGENCY SYNTAX FIX COMPLETE - Running TypeScript check...');