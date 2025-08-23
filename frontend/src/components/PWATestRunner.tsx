import React, { useState } from 'react';
import { pwaBrowserTester, PWATestSuite } from '../tests/pwa-browser-tests';

interface TestRunnerProps {
onTestComplete?: (results: PWATestSuite) => void;

const PWATestRunner: React.FC<TestRunnerProps> = ({ onTestComplete
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<PWATestSuite | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setError(null);
    
    try {
      const testResults = await pwaBrowserTester.runAllTests();
      setResults(testResults);
      onTestComplete?.(testResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsRunning(false);
  };

  const downloadReport = () => {
    if (!results) return;
    
    const report = pwaBrowserTester.generateReport(results);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pwa-test-report-${results.browser.name}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (result: any) => {
    if (result.working) return '✅';
    if (result.supported) return '⚠️';
    return '❌';
  };

  const getStatusText = (result: any) => {
    if (result.working) return 'Working';
    if (result.supported) return 'Partial';
    return 'Not Supported';
  };

  const getStatusColor = (result: any) => {
    if (result.working) return 'text-green-600';
    if (result.supported) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          PWA Browser Compatibility Test
        </h2>
        <p className="text-gray-600">
          Test Progressive Web App features across different browsers and devices.
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={runTests}
          disabled={isRunning}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isRunning
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isRunning ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Running Tests...
            </span>
          ) : (
            'Run PWA Tests'
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Test Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          {/* Browser Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Browser Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Browser:</span>
                <div className="text-gray-900">{results.browser.name} {results.browser.version}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Engine:</span>
                <div className="text-gray-900">{results.browser.engine}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Platform:</span>
                <div className="text-gray-900">{results.browser.platform}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Device:</span>
                <div className="text-gray-900">{results.browser.isMobile ? 'Mobile' : 'Desktop'}</div>
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Overall PWA Score</h3>
              <div className="text-3xl font-bold text-blue-600">{results.overallScore}%</div>
            </div>
            <div className="mt-2">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${results.overallScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Feature Test Results</h3>
              <button
                onClick={downloadReport}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Download Report
              </button>
            </div>
            
            <div className="space-y-3">
              {results.results.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getStatusIcon(result)}</span>
                      <h4 className="font-medium text-gray-900">{result.feature}</h4>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor(result)}`}>
                      {getStatusText(result)}
                    </span>
                  </div>
                  
                  {result.error && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      <strong>Error:</strong> {result.error}
                    </div>
                  )}
                  
                  {result.details && (
                    <div className="mt-2">
                      <details className="text-sm">
                        <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-50 border rounded text-xs overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
            <div className="space-y-2 text-sm text-gray-700">
              {results.overallScore < 70 && (
                <div>• Consider testing on a more modern browser for better PWA support</div>
              )}
              {!results.results.find(r => r.feature === 'Service Worker')?.working && (
                <div>• Service Worker is essential for PWA functionality - check HTTPS and browser support</div>
              )}
              {!results.results.find(r => r.feature === 'Web App Manifest')?.working && (
                <div>• Ensure manifest.json is properly configured and accessible</div>
              )}
              {!results.results.find(r => r.feature === 'Install Prompt')?.working && (
                <div>• Install prompt may not be available on this browser/device combination</div>
              )}
              {results.overallScore >= 80 && (
                <div className="text-green-700">✅ Great PWA support! Your app should work well on this browser.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWATestRunner;
}}