import React from 'react';

interface Step {
  id: string;
  title: string;
  description?: string;
  completed?: boolean;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  currentStep,
  className = ''
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium
              ${index < currentStep 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : index === currentStep 
                ? 'border-blue-600 text-blue-600 bg-white' 
                : 'border-gray-300 text-gray-500 bg-white'
              }
            `}>
              {index < currentStep ? '✓' : index + 1}
            </div>
            
            {index < steps.length - 1 && (
              <div className={`
                w-full h-0.5 mx-2
                ${index < currentStep ? 'bg-blue-600' : 'bg-gray-300'}
              `} />
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4">
        <h3 className="text-lg font-medium text-gray-900">
          {steps[currentStep]?.title}
        </h3>
        {steps[currentStep]?.description && (
          <p className="text-sm text-gray-600 mt-1">
            {steps[currentStep].description}
          </p>
        )}
      </div>
    </div>
  );
};

export default StepProgress;
export type { StepProgressProps, Step };