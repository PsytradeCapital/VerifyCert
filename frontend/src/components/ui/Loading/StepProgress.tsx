import React from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';

interface Step {
id: string;
  title: string;
  description?: string;

interface StepProgressProps {
}}}
  steps: Step[];
  currentStep: string;
  completedSteps: string[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';

const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  currentStep,
  completedSteps,
  className = '',
  orientation = 'horizontal',
  size = 'md'
}) => {
  const getStepStatus = (stepId: string) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  const sizeConfig = {
    sm: { circle: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-sm' },
    md: { circle: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-sm' },
    lg: { circle: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-base' },
  };

  const config = sizeConfig[size];

  const stepVariants = {
    pending: { scale: 1, opacity: 0.6 },
    current: { scale: 1.1, opacity: 1 },
    completed: { scale: 1, opacity: 1
  };

  const lineVariants = {
    incomplete: { scaleX: 0 },
    complete: { scaleX: 1
  };

  if (orientation === 'vertical') {
    return (
      <div className={`flex flex-col ${className}`}>
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex">
              <div className="flex flex-col items-center mr-4">
                {/* Step Circle */}
                <motion.div
                  className={`
                    flex items-center justify-center ${config.circle} rounded-full border-2 transition-colors
                    ${status === 'completed' 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : status === 'current'
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white border-gray-300 text-gray-500'
                  `}
                  variants={stepVariants}
                  animate={status}
                  transition={{ duration: 0.3 }}
                >
                  {status === 'completed' ? (
                    <Check className={config.icon} />
                  ) : status === 'current' ? (
                    <Loader2 className={`${config.icon} animate-spin`} />
                  ) : (
                    <span className={`${config.text} font-medium`}>{index + 1}</span>
                  )}
                </motion.div>

                {/* Connector Line */}
                {!isLast && (
                  <div className="w-0.5 h-16 bg-gray-300 mt-2 relative overflow-hidden">
                    <motion.div
                      className="w-full bg-green-500 origin-top"
                      variants={lineVariants}
                      initial="incomplete"
                      animate={completedSteps.includes(step.id) ? "complete" : "incomplete"}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      style={{ height: '100%' }}
                    />
                  </div>
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 pb-8">
                <div
                  className={`
                    ${config.text} font-medium
                    ${status === 'current' 
                      ? 'text-blue-600' 
                      : status === 'completed'
                      ? 'text-green-600'
                      : 'text-gray-500'
                  `}
                >
                  {step.title}
                </div>
                {step.description && (
                  <div className="text-xs text-gray-400 mt-1">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );

  // Horizontal orientation
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <motion.div
                  className={`
                    flex items-center justify-center ${config.circle} rounded-full border-2 transition-colors
                    ${status === 'completed' 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : status === 'current'
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white border-gray-300 text-gray-500'
                  `}
                  variants={stepVariants}
                  animate={status}
                  transition={{ duration: 0.3 }}
                >
                  {status === 'completed' ? (
                    <Check className={config.icon} />
                  ) : status === 'current' ? (
                    <Loader2 className={`${config.icon} animate-spin`} />
                  ) : (
                    <span className={`${config.text} font-medium`}>{index + 1}</span>
                  )}
                </motion.div>
                
                {/* Step Label */}
                <div className="mt-2 text-center">
                  <div
                    className={`
                      ${config.text} font-medium
                      ${status === 'current' 
                        ? 'text-blue-600' 
                        : status === 'completed'
                        ? 'text-green-600'
                        : 'text-gray-500'
                    `}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-xs text-gray-400 mt-1">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-4 bg-gray-300 relative overflow-hidden">
                  <motion.div
                    className="h-full bg-green-500 origin-left"
                    variants={lineVariants}
                    initial="incomplete"
                    animate={completedSteps.includes(step.id) ? "complete" : "incomplete"}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgress;
}
}}}}}