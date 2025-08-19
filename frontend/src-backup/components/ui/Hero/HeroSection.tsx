import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Upload, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { Button } from '../Button/Button';

export interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  showQRScanner?: boolean;
  showUpload?: boolean;
  onQRScan?: (data: string) => void;
  onFileUpload?: (file: File) => void;
  className?: string;
  backgroundVariant?: 'default' | 'gradient' | 'pattern';

const features = [
  {
    icon: Shield,
    title: 'Blockchain Verified',
    description: 'Certificates stored on immutable blockchain'
  },
  {
    icon: CheckCircle,
    title: 'Instant Verification',
    description: 'Verify authenticity in seconds'
  },
  {
    icon: QrCode,
    title: 'QR Code Support',
    description: 'Easy scanning and sharing'
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  title = 'Verify Digital Certificates',
  subtitle = 'Blockchain-Powered Certificate Verification',
  description = 'Instantly verify the authenticity of digital certificates using our secure blockchain-based verification system. Upload a certificate or scan a QR code to get started.',
  primaryAction = {
    label: 'Start Verification',
    onClick: () => {}
  },
  secondaryAction,
  showQRScanner = true,
  showUpload = true,
  onQRScan,
  onFileUpload,
  className = '',
  backgroundVariant = 'gradient'
}) => {
  const [isScanning, setIsScanning] = useState(false);

  const handleQRScan = () => {
    setIsScanning(true);
    // Simulate QR scanning
    setTimeout(() => {
      setIsScanning(false);
      onQRScan?.('sample-certificate-id');
    }, 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload?.(file);
  };

  const backgroundClasses = {
    default: 'bg-white',
    gradient: 'bg-gradient-to-br from-blue-50 via-white to-indigo-50',
    pattern: 'bg-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-white to-transparent'
  };

  return (
    <section className={`relative py-20 px-4 sm:px-6 lg:px-8 ${backgroundClasses[backgroundVariant]} ${className}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-blue-100 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 rounded-full bg-indigo-100 opacity-20 blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center">
          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              {title}
            </h1>
            <p className="text-xl sm:text-2xl text-blue-600 font-semibold mb-4">
              {subtitle}
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
              {description}
            </p>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Button
              variant="default"
              size="lg"
              onClick={primaryAction.onClick}
              loading={primaryAction.loading}
              iconPosition="right"
              className="min-w-[200px]"
            >
              {primaryAction.label}
            </Button>

            {secondaryAction && (
              <Button
                variant="outline"
                size="lg"
                onClick={secondaryAction.onClick}
                className="min-w-[200px]"
              >
                {secondaryAction.label}
              </Button>
            )}
          </motion.div>

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            {showQRScanner && (
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleQRScan}
                  loading={isScanning}
                  loadingText="Scanning..."
                  className="w-32 h-32 flex-col rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-400"
                >
                  <span className="mt-2 text-sm font-medium">Scan QR Code</span>
                </Button>
              </div>
            )}

            {showUpload && (
              <div className="flex flex-col items-center">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-32 h-32 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                    <Upload className="w-6 h-6 text-gray-600" />
                    <span className="mt-2 text-sm font-medium text-gray-600">Upload File</span>
                  </div>
                </label>
              </div>
            )}
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};