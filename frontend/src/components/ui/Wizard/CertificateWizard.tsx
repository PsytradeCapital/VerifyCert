import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';

interface WizardStep {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<any>;
  isValid?: boolean;
  isOptional?: boolean;
}

interface CertificateWizardProps {
  steps: WizardStep[];
  onComplete: (data: any) => void;
  onCancel?: () => void;
  className?: string;
}

export const CertificateWizard: React.FC<CertificateWizardProps> = ({
  steps,
  onComplete,
  onCancel,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const isStepValid = useCallback((stepIndex: number) => {
    const step = steps[stepIndex];
    if (step.isOptional) return true;
    return step.isValid !== false && stepData[step.id] !== undefined;
  }, [steps, stepData]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepData = (stepId: string, data: any) => {
    setStepData(prev => ({
      ...prev,
      [stepId]: data
    }));
  };

  const handleComplete = () => {
    const allData = steps.reduce((acc, step) => ({
      ...acc,
      [step.id]: stepData[step.id]
    }), {});
    
    onComplete(allData);
  };

  const canProceed = isStepValid(currentStep);
  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header with step indicator */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create Certificate
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  completedSteps.has(index)
                    ? 'bg-green-600 text-white'
                    : index === currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                {completedSteps.has(index) ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-600 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {currentStepData.title}
          </h3>
          {currentStepData.description && (
            <p className="text-gray-600 dark:text-gray-400">
              {currentStepData.description}
            </p>
          )}
        </div>

        {/* Render current step component */}
        <div className="min-h-[300px]">
          <currentStepData.component
            data={stepData[currentStepData.id]}
            onChange={(data: any) => handleStepData(currentStepData.id, data)}
            onValidationChange={(isValid: boolean) => {
              // Update step validity
              steps[currentStep].isValid = isValid;
            }}
          />
        </div>
      </div>

      {/* Footer with navigation */}
      <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4 mr-2 inline" />
              Cancel
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          {isLastStep ? (
            <button
              onClick={handleComplete}
              disabled={!canProceed}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4 mr-1" />
              Complete
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateWizard;