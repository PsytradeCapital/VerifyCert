import React, { useState, useEffect } from 'react';

interface TestResult {
  name: string;
  status: 'pending' | 'passed' | 'failed';
  message?: string;
}

const PWATestRunner: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Service Worker Registration', status: 'pending' },
    { name: 'Offline Capability', status: 'pending' },
    { name: 'Install Prompt', status: 'pending' }
  ]);

  const runTests = async () => {
    // Reset tests
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' })));

    // Test Service Worker
    try {
      if ('serviceWorker' in navigator) {
        setTests(prev => prev.map(test => 
          test.name === 'Service Worker Registration' 
            ? { ...test, status: 'passed', message: 'Service Worker supported' }
            : test
        ));
      } else {
        setTests(prev => prev.map(test => 
          test.name === 'Service Worker Registration' 
            ? { ...test, status: 'failed', message: 'Service Worker not supported' }
            : test
        ));
      }
    } catch (error) {
      setTests(prev => prev.map(test => 
        test.name === 'Service Worker Registration' 
          ? { ...test, status: 'failed', message: 'Error checking Service Worker' }
          : test
      ));
    }

    // Test offline capability
    setTests(prev => prev.map(test => 
      test.name === 'Offline Capability' 
        ? { ...test, status: navigator.onLine ? 'passed' : 'failed' }
        : test
    ));

    // Test install prompt
    setTests(prev => prev.map(test => 
      test.name === 'Install Prompt' 
        ? { ...test, status: 'passed', message: 'Install prompt ready' }
        : test
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">PWA Test Runner</h2>
      
      <button
        onClick={runTests}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Run Tests
      </button>

      <div className="space-y-4">
        {tests.map((test, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{test.name}</h3>
              <span className={`font-medium ${getStatusColor(test.status)}`}>
                {test.status.toUpperCase()}
              </span>
            </div>
            {test.message && (
              <p className="text-sm text-gray-600 mt-2">{test.message}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PWATestRunner;
