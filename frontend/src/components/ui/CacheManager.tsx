import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trash2, 
  RefreshCw, 
  HardDrive, 
  Wifi, ;;
  WifiOff, ;;
  Download,;;
  Smartphone,;;
  Monitor;;
} from 'lucide-react';
import useServiceWorker, { usePWAInstallation } from '../../hooks/useServiceWorker';

interface CacheManagerProps {
className?: string;

export const CacheManager: React.FC<CacheManagerProps> = ({ className = ''
}) => {
  const [swState, swActions] = useServiceWorker();
  const { canInstall, isInstalled, installPWA } = usePWAInstallation();
  const [isClearing, setIsClearing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await swActions.clearCache();
    } finally {
      setIsClearing(false);
  };

  const handleRefreshCacheSize = async () => {
    setIsRefreshing(true);
    try {
      await swActions.refreshCacheSize();
    } finally {
      setIsRefreshing(false);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">App Settings</h3>
        <div className="flex items-center space-x-2">
          {swState.isOffline ? (
            <div className="flex items-center space-x-1 text-red-600 text-sm">
              <WifiOff size={16} />
              <span>Offline</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-green-600 text-sm">
              <Wifi size={16} />
              <span>Online</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* PWA Installation */}
        <div className="border-b border-gray-200 pb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Smartphone className="mr-2" size={16} />
            Progressive Web App
          </h4>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  {isInstalled ? 'App is installed' : 'Install VerifyCert as an app'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {isInstalled 
                    ? 'You can access VerifyCert from your home screen'
                    : 'Get faster access and offline capabilities'
                </p>
              </div>
              
              {canInstall && !isInstalled && (
                <button
                  onClick={installPWA}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <Download size={16} />
                  <span>Install</span>
                </button>
              )}
              
              {isInstalled && (
                <div className="flex items-center space-x-2 text-green-600">
                  <Monitor size={16} />
                  <span className="text-sm font-medium">Installed</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Service Worker Status */}
        <div className="border-b border-gray-200 pb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Service Worker</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Status</span>
                <div className={`w-2 h-2 rounded-full ${
                  swState.isRegistered ? 'bg-green-500' : 'bg-gray-400'
                }`} />
              </div>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {swState.isRegistered ? 'Active' : 'Inactive'}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Updates</span>
                {swState.hasUpdate && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                )}
              </div>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {swState.hasUpdate ? 'Available' : 'Up to date'}
              </p>
            </div>
          </div>

          {swState.hasUpdate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4"
            >
              <button
                onClick={swActions.update}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Download size={16} />
                <span>Update Now</span>
              </button>
            </motion.div>
          )}
        </div>

        {/* Cache Management */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <HardDrive className="mr-2" size={16} />
            Cache Management
          </h4>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-700">Cache Size</p>
                <p className="text-xs text-gray-500">
                  Cached data for offline access
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {formatBytes(swState.cacheSize)}
                </p>
                <button
                  onClick={handleRefreshCacheSize}
                  disabled={isRefreshing}
                  className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50 flex items-center space-x-1"
                >
                  <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
            
            <button
              onClick={handleClearCache}
              disabled={isClearing}
              className="w-full bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Trash2 size={16} />
              <span>{isClearing ? 'Clearing...' : 'Clear Cache'}</span>
            </button>
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              This will remove all cached data and may affect offline functionality
            </p>
          </div>
        </div>

        {/* Error Display */}
        {swState.error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <h5 className="text-sm font-medium text-red-800 mb-1">Error</h5>
            <p className="text-sm text-red-700">{swState.error}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CacheManager;
}
}}}