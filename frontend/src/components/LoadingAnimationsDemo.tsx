import React, { useState, useEffect } from 'react';
import {
  Spinner,
  DotsSpinner,
  PulseSpinner,
  ProgressBar,
  CircularProgress,
  Skeleton,
  CertificateCardSkeleton,;
  LoadingOverlay,;;
  LoadingButton,;;
  StepProgress;;
} from './ui/Loading';

const LoadingAnimationsDemo: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isOverlayLoading, setIsOverlayLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('step1');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Simulate progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 0 : prev + 10));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { id: 'step1', title: 'Validation', description: 'Validating certificate data' },
    { id: 'step2', title: 'Processing', description: 'Processing on blockchain' },
    { id: 'step3', title: 'Confirmation', description: 'Confirming transaction' },
    { id: 'step4', title: 'Complete', description: 'Certificate issued'
  ];

  const handleStepDemo = () => {
    const stepOrder = ['step1', 'step2', 'step3', 'step4'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex < stepOrder.length - 1) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(stepOrder[currentIndex + 1]);
    } else {
      // Reset demo
      setCompletedSteps([]);
      setCurrentStep('step1');
  };

  const handleButtonDemo = () => {
    setIsButtonLoading(true);
    setTimeout(() => setIsButtonLoading(false), 3000);
  };

  const handleOverlayDemo = () => {
    setIsOverlayLoading(true);
    setTimeout(() => setIsOverlayLoading(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Loading Animations Demo</h1>
        <p className="text-gray-600">Comprehensive showcase of loading components with Framer Motion animations</p>
      </div>

      {/* Spinners Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Spinners</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Basic Spinner */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Basic Spinner</h3>
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Spinner size="sm" />
              <Spinner size="default" />
              <Spinner size="lg" />
              <Spinner size="xl" />
            </div>
            <div className="flex items-center justify-center space-x-4">
              <Spinner color="primary" />
              <Spinner color="success" />
              <Spinner color="warning" />
              <Spinner color="error" />
            </div>
          </div>

          {/* Dots Spinner */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Dots Spinner</h3>
            <div className="flex items-center justify-center space-x-4 mb-4">
              <DotsSpinner size="sm" />
              <DotsSpinner size="default" />
              <DotsSpinner size="lg" />
            </div>
            <div className="flex items-center justify-center space-x-4">
              <DotsSpinner color="primary" />
              <DotsSpinner color="success" />
              <DotsSpinner color="error" />
            </div>
          </div>

          {/* Pulse Spinner */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Pulse Spinner</h3>
            <div className="flex items-center justify-center space-x-4 mb-4">
              <PulseSpinner size="sm" />
              <PulseSpinner size="default" />
              <PulseSpinner size="lg" />
            </div>
            <div className="flex items-center justify-center space-x-4">
              <PulseSpinner color="primary" />
              <PulseSpinner color="success" />
              <PulseSpinner color="error" />
            </div>
          </div>
        </div>
      </section>

      {/* Progress Indicators Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Progress Indicators</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Progress Bar */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Progress Bar</h3>
            <div className="space-y-4">
              <ProgressBar progress={progress} showLabel label="Upload Progress" />
              <ProgressBar progress={75} color="success" showLabel label="Verification" />
              <ProgressBar progress={45} color="warning" showLabel label="Processing" />
              <ProgressBar progress={90} color="error" showLabel label="Error Recovery" />
            </div>
          </div>

          {/* Circular Progress */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Circular Progress</h3>
            <div className="flex items-center justify-center space-x-6">
              <CircularProgress progress={progress} showLabel size="sm" />
              <CircularProgress progress={75} showLabel color="success" />
              <CircularProgress progress={45} showLabel color="warning" size="lg" />
              <CircularProgress progress={90} showLabel color="error" size="xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Skeleton Loaders Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Skeleton Loaders</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Skeletons */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Basic Skeletons</h3>
            <div className="space-y-4">
              <Skeleton variant="text" />
              <Skeleton variant="text" lines={3} />
              <div className="flex items-center space-x-4">
                <Skeleton variant="circular" width={40} height={40} />
                <div className="flex-1">
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </div>
              </div>
              <Skeleton variant="rectangular" height={100} />
            </div>
          </div>

          {/* Certificate Card Skeleton */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Certificate Card Skeleton</h3>
            <CertificateCardSkeleton />
          </div>
        </div>
      </section>

      {/* Interactive Components Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Interactive Components</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Loading Button */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Loading Button</h3>
            <div className="space-y-4">
              <LoadingButton
                loading={isButtonLoading}
                loadingText="Processing..."
                onClick={handleButtonDemo}
                variant="primary"
              >
                Issue Certificate
              </LoadingButton>
              
              <LoadingButton
                loading={isButtonLoading}
                loadingText="Verifying..."
                onClick={handleButtonDemo}
                variant="outline"
                size="lg"
              >
                Verify Certificate
              </LoadingButton>
            </div>
          </div>

          {/* Loading Overlay */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Loading Overlay</h3>
            <LoadingOverlay
              isLoading={isOverlayLoading}
              message="Processing certificate..."
              spinnerType="pulse"
              backdrop="blur"
            >
              <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <button
                  onClick={handleOverlayDemo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Trigger Overlay
                </button>
              </div>
            </LoadingOverlay>
          </div>
        </div>
      </section>

      {/* Step Progress Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Step Progress</h2>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-6">Certificate Issuance Progress</h3>
          
          <StepProgress
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            className="mb-6"
          />
          
          <div className="text-center">
            <button
              onClick={handleStepDemo}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Next Step
            </button>
          </div>
        </div>

        {/* Vertical Step Progress */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-6">Vertical Step Progress</h3>
          
          <StepProgress
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            orientation="vertical"
            size="lg"
          />
        </div>
      </section>

      {/* Usage Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Usage Examples</h2>
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Code Examples</h3>
          <div className="space-y-4 text-sm">
            <div className="bg-white p-4 rounded border">
              <code className="text-gray-800">
                {`<Spinner size="lg" color="primary" />`}
              </code>
            </div>
            <div className="bg-white p-4 rounded border">
              <code className="text-gray-800">
                {`<ProgressBar progress={75} showLabel color="success" />`}
              </code>
            </div>
            <div className="bg-white p-4 rounded border">
              <code className="text-gray-800">
                {`<LoadingButton loading={isLoading} loadingText="Processing...">Submit</LoadingButton>`}
              </code>
            </div>
            <div className="bg-white p-4 rounded border">
              <code className="text-gray-800">
                {`<LoadingOverlay isLoading={loading} message="Please wait...">Content</LoadingOverlay>`}
              </code>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoadingAnimationsDemo;
}}