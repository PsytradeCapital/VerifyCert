import React from 'react';
import { Link } from 'react-router-dom';
import { PageTransition } from '../components/ui';
import { Container } from '../components/ui';

const PageTransitionDemo: React.FC = () => {
  return (
    <PageTransition className="min-h-screen py-8">
      <Container>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Page Transition Demo
          </h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Smooth Page Transitions with Framer Motion
            </h2>
            <p className="text-gray-600 mb-4">
              This page demonstrates the PageTransition component in action. 
              Navigate between different pages to see the smooth fade and slide animations.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                to="/"
                className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              >
                <h3 className="font-medium text-blue-900 mb-2">Home Page</h3>
                <p className="text-sm text-blue-700">
                  Navigate to the home page to see the transition effect
                </p>
              </Link>
              
              <Link
                to="/verify"
                className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
              >
                <h3 className="font-medium text-green-900 mb-2">Verify Page</h3>
                <p className="text-sm text-green-700">
                  Go to the certificate verification page
                </p>
              </Link>
              
              <Link
                to="/dashboard"
                className="block p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
              >
                <h3 className="font-medium text-purple-900 mb-2">Dashboard</h3>
                <p className="text-sm text-purple-700">
                  Access the issuer dashboard (requires wallet)
                </p>
              </Link>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Animation Details
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• <strong>Initial state:</strong> Opacity 0, Y offset +20px</li>
              <li>• <strong>Enter animation:</strong> Fade in with upward slide</li>
              <li>• <strong>Exit animation:</strong> Fade out with downward slide</li>
              <li>• <strong>Duration:</strong> 300ms with anticipate easing</li>
              <li>• <strong>Library:</strong> Framer Motion with custom variants</li>
            </ul>
          </div>
        </div>
      </Container>
    </PageTransition>
  );
};

export default PageTransitionDemo;