import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trash2, 
  RefreshCw, 
  HardDrive, 
  Wifi, 
  WifiOff, 
  Download,
  Smartphone,
  Monitor
} from 'lucide-react';

interface CacheManagerProps {
  className?: string;
}

export const CacheManager: React.FC<CacheManagerProps> = ({ className = '' }) => {
  const [isClearing, setIsClearing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cacheSize, setCacheSize] = useState<string>('0 MB');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      // Clear localStorage
      localStorage.clear();
      // Clear sessionStorage
      sessionStorage.clear();
      
      setCacheSize('0 MB');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  const estimateCacheSize = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const sizeInMB = (usage / (1024 * 1024)).toFixed(2);
        setCacheSize(`${sizeInMB} MB`);
      }
    } catch (error) {
      console.error('Failed to estimate cache size:', error);
    }
  };

  useEffect(() => {
    estimateCacheSize();
  }, []);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <HardDrive className="w-5 h-5 mr-2" />
          Cache Manager
        </h3>
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-500" />
          )}
          <span className="text-sm text-gray-600">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-900">Cache Size</p>
            <p className="text-xs text-gray-600">Current storage usage</p>
          </div>
          <span className="text-lg font-semibold text-blue-600">{cacheSize}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <motion.button
            onClick={handleClearCache}
            disabled={isClearing}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isClearing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {isClearing ? 'Clearing...' : 'Clear Cache'}
            </span>
          </motion.button>

          <motion.button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isRefreshing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {isRefreshing ? 'Refreshing...' : 'Refresh App'}
            </span>
          </motion.button>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Clear cache to free up storage space and resolve loading issues
          </p>
        </div>
      </div>
    </div>
  );
};

export default CacheManager;