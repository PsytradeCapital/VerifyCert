import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

export interface FeedbackAnimationProps {
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  message: string;
  isVisible: boolean;
  onClose?: () => void;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  showIcon?: boolean;
  showCloseButton?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2,
};

const colorMap = {
  success: {
    bg: 'bg-green-500',
    border: 'border-green-400',
    text: 'text-white',
    icon: 'text-white',
  },
  error: {
    bg: 'bg-red-500',
    border: 'border-red-400',
    text: 'text-white',
    icon: 'text-white',
  },
  warning: {
    bg: 'bg-yellow-500',
    border: 'border-yellow-400',
    text: 'text-white',
    icon: 'text-white',
  },
  info: {
    bg: 'bg-blue-500',
    border: 'border-blue-400',
    text: 'text-white',
    icon: 'text-white',
  },
  loading: {
    bg: 'bg-gray-500',
    border: 'border-gray-400',
    text: 'text-white',
    icon: 'text-white',
  },
};

const positionMap = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
};

const slideVariants = {
  'top-right': {
    initial: { x: 100, opacity: 0, scale: 0.8 },
    animate: { x: 0, opacity: 1, scale: 1 },
    exit: { x: 100, opacity: 0, scale: 0.8 },
  },
  'top-left': {
    initial: { x: -100, opacity: 0, scale: 0.8 },
    animate: { x: 0, opacity: 1, scale: 1 },
    exit: { x: -100, opacity: 0, scale: 0.8 },
  },
  'bottom-right': {
    initial: { x: 100, y: 100, opacity: 0, scale: 0.8 },
    animate: { x: 0, y: 0, opacity: 1, scale: 1 },
    exit: { x: 100, y: 100, opacity: 0, scale: 0.8 },
  },
  'bottom-left': {
    initial: { x: -100, y: 100, opacity: 0, scale: 0.8 },
    animate: { x: 0, y: 0, opacity: 1, scale: 1 },
    exit: { x: -100, y: 100, opacity: 0, scale: 0.8 },
  },
  'center': {
    initial: { scale: 0.3, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.3, opacity: 0 },
  },
};

export const FeedbackAnimation: React.FC<FeedbackAnimationProps> = ({
  type,
  message,
  isVisible,
  onClose,
  duration = 4000,
  position = 'top-right',
  showIcon = true,
  showCloseButton = true,
  action,
}) => {
  const Icon = iconMap[type];
  const colors = colorMap[type];
  const variants = slideVariants[position];

  React.useEffect(() => {
    if (isVisible && duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed z-50 ${positionMap[position]} max-w-sm w-full`}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        >
          <div
            className={`
              ${colors.bg} ${colors.border} ${colors.text}
              border rounded-lg shadow-lg p-4
              backdrop-blur-sm bg-opacity-95
            `}
          >
            <div className="flex items-start">
              {showIcon && (
                <div className="flex-shrink-0">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  >
                    {type === 'loading' ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Icon className={`h-5 w-5 ${colors.icon}`} />
                      </motion.div>
                    ) : (
                      <Icon className={`h-5 w-5 ${colors.icon}`} />
                    )}
                  </motion.div>
                </div>
              )}
              
              <div className="ml-3 w-0 flex-1">
                <motion.p
                  className="text-sm font-medium"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {message}
                </motion.p>
                
                {action && (
                  <motion.div
                    className="mt-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <button
                      onClick={action.onClick}
                      className="text-sm underline hover:no-underline transition-all duration-200"
                    >
                      {action.label}
                    </button>
                  </motion.div>
                )}
              </div>
              
              {showCloseButton && onClose && (
                <div className="ml-4 flex-shrink-0 flex">
                  <motion.button
                    className="inline-flex text-white hover:text-gray-200 focus:outline-none focus:text-gray-200 transition-colors duration-200"
                    onClick={onClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Success animation with celebration effect
export const SuccessAnimation: React.FC<{
  message: string;
  isVisible: boolean;
  onClose?: () => void;
  showConfetti?: boolean;
}> = ({ message, isVisible, onClose, showConfetti = false }) => {
  return (
    <>
      <FeedbackAnimation
        type="success"
        message={message}
        isVisible={isVisible}
        onClose={onClose}
        position="center"
      />
      
      {showConfetti && isVisible && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Confetti particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-green-400 rounded-full"
              initial={{
                x: "50vw",
                y: "50vh",
                scale: 0,
              }}
              animate={{
                x: `${50 + (Math.random() - 0.5) * 100}vw`,
                y: `${50 + (Math.random() - 0.5) * 100}vh`,
                scale: [0, 1, 0],
                rotate: 360,
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                ease: "easeOut",
              }}
            />
          ))}
        </motion.div>
      )}
    </>
  );
};

// Error animation with shake effect
export const ErrorAnimation: React.FC<{
  message: string;
  isVisible: boolean;
  onClose?: () => void;
  shake?: boolean;
}> = ({ message, isVisible, onClose, shake = true }) => {
  return (
    <motion.div
      animate={shake && isVisible ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.5 }}
    >
      <FeedbackAnimation
        type="error"
        message={message}
        isVisible={isVisible}
        onClose={onClose}
        duration={6000}
      />
    </motion.div>
  );
};

// Loading animation with pulse effect
export const LoadingAnimation: React.FC<{
  message: string;
  isVisible: boolean;
  progress?: number;
}> = ({ message, isVisible, progress }) => {
  return (
    <motion.div
      animate={isVisible ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <FeedbackAnimation
        type="loading"
        message={message}
        isVisible={isVisible}
        showCloseButton={false}
        duration={0}
      />
      
      {progress !== undefined && (
        <motion.div
          className="fixed top-20 right-4 bg-white rounded-full p-2 shadow-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 relative">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-300"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <motion.path
                className="text-blue-500"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                initial={{ strokeDasharray: "0 100" }}
                animate={{ strokeDasharray: `${progress} 100` }}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-700">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FeedbackAnimation;