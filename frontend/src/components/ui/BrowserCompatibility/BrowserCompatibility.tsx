/**
 * Browser Compatibility Component
 * Displays browser compatibility information and warnings
 */

import React, { useState, useEffect } from 'react';
import { detectBrowser, getBrowserCompatibilityScore, getBrowserRecommendations, BrowserInfo } from '../../../utils/browserDetection';

interface BrowserCompatibilityProps {
  showDetails?: boolean;
  showRecommendations?: boolean;
  minCompatibilityScore?: number;
  className?: string;

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
      {/* Compatibility Score */}
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
              aria-expanded={isExpanded}
              aria-controls="browser-details"
            >
              {isExpanded ? 'Hide Details' : 'Show Details'}
            </button>
          )}
        </div>

        {/* Compatibility Status */}
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

      {/* Expanded Details */}
      {isExpanded && (
        <div id="browser-details" className="mt-4 space-y-4">
          {/* Browser Details */}
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
                <div>
                  <span className="font-medium text-gray-700">Service Worker:</span>
                  <span className={`ml-2 ${browserInfo.features.serviceWorker ? 'text-green-600' : 'text-red-600'}`}>
                    {browserInfo.features.serviceWorker ? 'Supported' : 'Not Supported'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">WebP Images:</span>
                  <span className={`ml-2 ${browserInfo.features.webp ? 'text-green-600' : 'text-red-600'}`}>
                    {browserInfo.features.webp ? 'Supported' : 'Not Supported'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">CSS Grid:</span>
                  <span className={`ml-2 ${browserInfo.features.css.grid ? 'text-green-600' : 'text-red-600'}`}>
                    {browserInfo.features.css.grid ? 'Supported' : 'Not Supported'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Local Storage:</span>
                  <span className={`ml-2 ${browserInfo.features.localStorage ? 'text-green-600' : 'text-red-600'}`}>
                    {browserInfo.features.localStorage ? 'Supported' : 'Not Supported'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {showRecommendations && hasRecommendations && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Recommendations
              </h4>
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

          {/* Feature Support Grid */}
          {showDetails && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Feature Support</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
                {Object.entries(browserInfo.features).map(([feature, supported]) => {
                  if (feature === 'css') {
                    return Object.entries(supported).map(([cssFeature, cssSupported]) => (
                      <div key={`css-${cssFeature}`} className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="capitalize">{cssFeature.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className={cssSupported ? 'text-green-600' : 'text-red-600'}>
                          {cssSupported ? '✓' : '✗'}
                        </span>
                      </div>
                    ));
                  
                  return (
                    <div key={feature} className="flex items-center justify-between p-2 bg-white rounded border">
                      <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className={supported ? 'text-green-600' : 'text-red-600'}>
                        {supported ? '✓' : '✗'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrowserCompatibility;