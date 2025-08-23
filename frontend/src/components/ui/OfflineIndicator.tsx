import React from 'react';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, Download, RefreshCw, Share, Plus, Home } from 'lucide-react';
import { useOfflineStatus } from '../../hooks/useServiceWorker';
import { trackInstallPromptEvent } from '../../utils/pwaUtils';

interface OfflineIndicatorProps {
className?: string;
  showOnlineStatus?: boolean;

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className = '',
  showOnlineStatus = false
}) => {
  const isOffline = useOfflineStatus();

  // Only show indicator when offline, or when showOnlineStatus is true
  const shouldShow = isOffline || showOnlineStatus;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-0 left-0 right-0 z-50 ${className}`}
        >
          <div
            className={`
              px-4 py-2 text-sm font-medium text-center
              ${isOffline 
                ? 'bg-red-500 text-white' 
                : 'bg-green-500 text-white'
            `}
          >
            <div className="flex items-center justify-center space-x-2">
              {isOffline ? (
                <>
                  <WifiOff size={16} />
                  <span>You're offline. Some features may be limited.</span>
                </>
              ) : (
                <>
                  <Wifi size={16} />
                  <span>Back online!</span>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface ServiceWorkerUpdateProps {
hasUpdate: boolean;
  onUpdate: () => void;
  className?: string;

export const ServiceWorkerUpdate: React.FC<ServiceWorkerUpdateProps> = ({
  hasUpdate,
  onUpdate,
  className = ''
}) => {
  return (
    <AnimatePresence>
      {hasUpdate && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className={`fixed bottom-4 right-4 z-50 ${className}`}
        >
          <div className="bg-blue-500 text-white rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-start space-x-3">
              <Download className="text-blue-200 mt-0.5" size={20} />
              <div className="flex-1">
                <h4 className="font-medium text-sm">Update Available</h4>
                <p className="text-blue-100 text-xs mt-1">
                  A new version of VerifyCert is ready to install.
                </p>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={onUpdate}
                    className="bg-white text-blue-500 px-3 py-1 rounded text-xs font-medium hover:bg-blue-50 transition-colors"
                  >
                    Update Now
                  </button>
                  <button
                    onClick={() => {/* Handle dismiss */}}
                    className="text-blue-200 px-3 py-1 rounded text-xs hover:text-white transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface PWAInstallPromptProps {
canInstall: boolean;
  onInstall: () => Promise<boolean>;
  className?: string;

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  canInstall,
  onInstall,
  className = ''
}) => {
  const [isInstalling, setIsInstalling] = React.useState(false);
  const [isDismissed, setIsDismissed] = React.useState(false);
  const [showPrompt, setShowPrompt] = React.useState(false);

  // Detect if user is on mobile device
  const isMobile = React.useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  // Show prompt with delay for better UX
  React.useEffect(() => {
    if (canInstall && !isDismissed) {
      // Show prompt after a short delay for better UX
      const timer = setTimeout(() => {
        setShowPrompt(true);
        trackInstallPromptEvent('prompt_shown');
      }, 3000); // 3 second delay

      return () => clearTimeout(timer);
  }, [canInstall, isDismissed]);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await onInstall();
      if (success) {
        setIsDismissed(true);
        setShowPrompt(false);
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowPrompt(false);
    trackInstallPromptEvent('prompt_dismissed');
  };

  const shouldShow = canInstall && !isDismissed && showPrompt;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.4 
          }}
          className={`fixed z-50 ${className} ${
            isMobile 
              ? 'bottom-0 left-0 right-0 mx-0' 
              : 'bottom-4 left-4 right-4 mx-auto max-w-sm'
          }`}
        >
          <div className={`
            bg-white border-t border-gray-200 shadow-2xl
            ${isMobile 
              ? 'rounded-t-2xl p-6 pb-8' 
              : 'rounded-xl border border-gray-200 p-4'
          `}>
            {/* Mobile-specific header */}
            {isMobile && (
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            )}
            
            <div className="flex items-start space-x-4">
              <div className={`
                bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg
                ${isMobile ? 'p-4' : 'p-3'}
              `}>
                <Download className="text-white" size={isMobile ? 24 : 20} />
              </div>
              
              <div className="flex-1">
                <h4 className={`
                  font-semibold text-gray-900
                  ${isMobile ? 'text-lg' : 'text-sm'}
                `}>
                  {isMobile ? 'Add to Home Screen' : 'Install VerifyCert'}
                </h4>
                
                <p className={`
                  text-gray-600 mt-1
                  ${isMobile ? 'text-sm' : 'text-xs'}
                `}>
                  {isMobile 
                    ? 'Get quick access to certificate verification with our mobile app. Works offline too!'
                    : 'Install our app for a better experience with offline access.'
                </p>

                {/* Mobile-specific benefits */}
                {isMobile && (
                  <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Offline access</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Fast loading</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Home screen</span>
                    </div>
                  </div>
                )}
                
                <div className={`
                  flex space-x-3 mt-4
                  ${isMobile ? 'flex-col space-x-0 space-y-3' : 'flex-row'}
                `}>
                  <button
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className={`
                      bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium 
                      rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl
                      disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center justify-center space-x-2
                      ${isMobile 
                        ? 'py-3 px-6 text-base' 
                        : 'px-4 py-2 text-xs'
                      ${isInstalling ? 'bg-gray-400' : 'hover:from-blue-600 hover:to-blue-700'}
                    `}
                  >
                    {isInstalling && (
                      <RefreshCw 
                        size={isMobile ? 16 : 12} 
                        className="animate-spin" 
                      />
                    )}
                    <span>
                      {isInstalling 
                        ? 'Installing...' 
                        : isMobile 
                          ? 'Add to Home Screen' 
                          : 'Install'
                    </span>
                  </button>
                  
                  <button
                    onClick={handleDismiss}
                    className={`
                      text-gray-500 font-medium rounded-lg transition-colors
                      hover:text-gray-700 hover:bg-gray-100
                      ${isMobile 
                        ? 'py-3 px-6 text-base' 
                        : 'px-4 py-2 text-xs'
                    `}
                  >
                    {isMobile ? 'Maybe Later' : 'Not now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface IOSInstallInstructionsProps {
isVisible: boolean;
  onDismiss: () => void;
  className?: string;

export const IOSInstallInstructions: React.FC<IOSInstallInstructionsProps> = ({
  isVisible,
  onDismiss,
  className = ''
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}
        >
          <div className="bg-white border-t border-gray-200 shadow-2xl rounded-t-2xl p-6 pb-8">
            {/* Handle bar */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Home className="text-white" size={24} />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Add to Home Screen
              </h3>
              
              <p className="text-sm text-gray-600 mb-6">
                Install VerifyCert on your iPhone for quick access and offline use.
              </p>
              
              {/* Step-by-step instructions */}
              <div className="space-y-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">
                      Tap the share button
                    </span>
                    <div className="bg-gray-100 p-1 rounded">
                      <Share size={16} className="text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-700">
                      in Safari
                    </span>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">
                      Select "Add to Home Screen"
                    </span>
                    <div className="bg-gray-100 p-1 rounded">
                      <Plus size={16} className="text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <span className="text-sm text-gray-700">
                    Tap "Add" to install VerifyCert
                  </span>
                </div>
              </div>
              
              <button
                onClick={onDismiss}
                className="w-full mt-6 py-3 px-6 bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors hover:bg-gray-200"
              >
                Got it
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;
}
}}}}}}}}}}}}