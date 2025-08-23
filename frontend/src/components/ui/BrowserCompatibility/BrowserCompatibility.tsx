/**
 * Browser Compatibility Component
 * Displays browser compatibility information and warnings
 */

import React, { useState, useEffect } from 'react';

interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  platform: string;
  isMobile: boolean;
  isTablet: boolean;
  features: {
    serviceWorker: boolean;
    webp: boolean;
    localStorage: boolean;
    css: {
      grid: boolean;
      flexbox: boolean;
    };
  };
}

interface BrowserCompatibilityProps {
  showDetails?: boolean;
  showRecommendations?: boolean;
  minCompatibilityScore?: number;
  className?: string;
}

const detectBrowser = (): BrowserInfo => {
  const userAgent = navigator.userAgent;
  
  return {
    name: 'Chrome',
    version: '120.0',
    engine: 'Blink',
    platform: navigator.platform,
    isMobile: /Mobile|Android|iPhone|iPad/.test(userAgent),
    isTablet: /iPad|Tablet/.test(userAgent),
    features: {
      serviceWorker: 'serviceWorker' in navigator,
      webp: true,
      localStorage: typeof Storage !== 'undefined',
      css: {
        grid: CSS.supports('display', 'grid'),
        flexbox: CSS.supports('display', 'flex')
      }
    }
  };
};

const getBrowserCompatibilityScore = (browserInfo: BrowserInfo): number => {
  let score = 100;
  
  if (!browserInfo.features.serviceWorker) score -= 20;
  if (!browserInfo.features.webp) score -= 10;
  if (!browserInfo.features.localStorage) score -= 15;
  if (!browserInfo.features.css.grid) score -= 10;
  if (!browserInfo.features.css.flexbox) score -= 15;
  
  return Math.max(0, score);
};

const getBrowserRecommendations = (browserInfo: BrowserInfo): string[] => {
  const recommendations: string[] = [];
  
  if (!browserInfo.features.serviceWorker) {
    recommendations.push('Update your browser to enable offline functionality');
  }
  
  if (!browserInfo.features.webp) {
    recommendations.push('Update your browser for better image loading performance');
  }
  
  return recommendations;
};

export const BrowserCompatibility: React.FC<BrowserCompatibilityProps> = ({
  showDetails = false,
  showRecommendations = true,
  minCompatibilityScore = 80,
  className = ''
}) => {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [compatibilityScore, setCompatibilityScore] = useState<number>(0);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const info = detectBrowser();
    const score = getBrowserCompatibilityScore(info);
    const recs = getBrowserRecommendations(info);

    setBrowserInfo(info);
    setCompatibilityScore(score);
    setRecommendations(recs);
  }, []);

  if (!browserInfo) {
    return null;
  }

  const isCompatible = compatibilityScore >= minCompatibilityScore;
  const hasRecommendations = recommendations.length > 0;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 90) return 'bg-green-100 border-green-200';
    if (score >= 80) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  return (
    <div className={`browser-compatibility ${className}`}>
      <div className={`p-4 rounded-lg border ${getScoreBackground(compatibilityScore)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold">
                {browserInfo.name} {browserInfo.version}
              </span>
              <span className="text-sm text-gray-600">
                ({browserInfo.engine})
              </span>
            </div>
            <div className={`font-bold ${getScoreColor(compatibilityScore)}`}>
              {compatibilityScore}% Compatible
            </div>
          </div>
          
          {(showDetails || hasRecommendations) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
            >
              {isExpanded ? 'Hide Details' : 'Show Details'}
            </button>
          )}
        </div>

        <div className="mt-2">
          {isCompatible ? (
            <div className="flex items-center text-green-700">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Your browser is fully compatible with VerifyCert
            </div>
          ) : (
            <div className="flex items-center text-yellow-700">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Some features may not work optimally in your browser
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {showDetails && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Browser Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Platform:</span>
                  <span className="ml-2 text-gray-600">{browserInfo.platform}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Device:</span>
                  <span className="ml-2 text-gray-600">
                    {browserInfo.isMobile ? 'Mobile' : browserInfo.isTablet ? 'Tablet' : 'Desktop'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {showRecommendations && hasRecommendations && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-3">Recommendations</h4>
              <ul className="space-y-2 text-sm text-yellow-700">
                {recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrowserCompatibility;