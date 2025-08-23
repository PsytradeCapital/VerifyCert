import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon, ShieldCheckIcon, QrCodeIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export default function Home(): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Issue tamper-proof certificates',
      description: 'Create secure, blockchain-based certificates that cannot be forged or altered.'
    },
    {
      icon: CheckCircleIcon,
      title: 'Verify certificate authenticity',
      description: 'Instantly verify any certificate using our decentralized verification system.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Blockchain-based security',
      description: 'Powered by Polygon blockchain for maximum security and transparency.'
    },
    {
      icon: QrCodeIcon,
      title: 'QR code verification',
      description: 'Quick and easy verification using QR codes for instant authentication.'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VerifyCert
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Decentralized Certificate Verification System
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Issue, verify, and manage digital certificates on the blockchain with complete security and transparency.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/issuer-dashboard"
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Issue Certificates
            </Link>
            <Link
              to="/verify"
              className="inline-flex items-center px-8 py-4 border-2 border-blue-600 text-lg font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Verify Certificate
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${400 + index * 100}ms` }}
              >
                <div className="flex items-center mb-4">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className={`mt-20 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
                <div className="text-gray-600">Secure & Tamper-proof</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">Instant</div>
                <div className="text-gray-600">Verification Process</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
                <div className="text-gray-600">Global Accessibility</div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className={`mt-20 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Issue</h3>
              <p className="text-gray-600">Create and issue certificates on the blockchain with complete security.</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Share</h3>
              <p className="text-gray-600">Share certificates with QR codes or direct links for easy access.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verify</h3>
              <p className="text-gray-600">Instantly verify authenticity with our decentralized system.</p>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className={`mt-20 text-center transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-6 opacity-90">Join the future of digital certificate verification</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/issuer-dashboard"
                className="inline-flex items-center px-6 py-3 border-2 border-white text-lg font-medium rounded-lg text-white hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                Start Issuing
              </Link>
              <Link
                to="/verify"
                className="inline-flex items-center px-6 py-3 bg-white text-lg font-medium rounded-lg text-blue-600 hover:bg-gray-100 transition-all duration-200"
              >
                Verify Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}}