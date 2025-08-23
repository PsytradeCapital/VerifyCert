import React, { useState } from 'react';

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
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step.completed ? 'bg-green-500 text-white' : 
              step.id === currentStep ? 'bg-blue-500 text-white' : 'bg-gray-300'
            }`}>
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
