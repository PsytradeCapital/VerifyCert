import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, Download, Share2, Eye, Copy } from 'lucide-react';
import Button from '../Button/Button';
import Card from '../Card/Card';

export interface VerificationResult {
  id: string;
  status: 'verified' | 'invalid' | 'pending' | 'error';
  certificateId?: string;
  recipientName?: string;
  courseName?: string;
  institution?: string;
  issueDate?: string;
  expiryDate?: string;
  issuerAddress?: string;
  blockchainTxHash?: string;
  metadata?: Record<string, any>;
  errorMessage?: string;
}

export interface VerificationResultsProps {
  result: VerificationResult;
  onDownload?: () => void;
  onShare?: () => void;
  onViewDetails?: () => void;
  className?: string;
  showActions?: boolean;
}

const statusConfig = {
  verified: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    title: 'Certificate Verified',
    description: 'This certificate is authentic and valid'
  },
  invalid: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    title: 'Certificate Invalid',
    description: 'This certificate could not be verified'
  },
  pending: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    title: 'Verification Pending',
    description: 'Certificate verification in progress'
  },
  error: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    title: 'Verification Error',
    description: 'An error occurred during verification'
  }
};

export const VerificationResults: React.FC<VerificationResultsProps> = ({
  result,
  onDownload,
  onShare,
  onViewDetails,
  className = '',
  showActions = true
}) => {
  const config = statusConfig[result.status];
  const Icon = config.icon;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could show a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card
        variant="elevated"
        padding="lg"
        className={`${config.bgColor} ${config.borderColor} border-2`}
      >
        {/* Status Header */}
        <div className="flex items-center mb-6">
          <div className={`p-3 rounded-full ${config.bgColor} mr-4`}>
            <Icon className={`w-8 h-8 ${config.color}`} />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${config.color}`}>
              {config.title}
            </h2>
            <p className="text-gray-600 mt-1">
              {result.errorMessage || config.description}
            </p>
          </div>
        </div>

        {/* Certificate Details */}
        {result.status === 'verified' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4 mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.recipientName && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <label className="text-sm font-medium text-gray-500">Recipient</label>
                  <p className="text-lg font-semibold text-gray-900">{result.recipientName}</p>
                </div>
              )}

              {result.courseName && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <label className="text-sm font-medium text-gray-500">Course/Program</label>
                  <p className="text-lg font-semibold text-gray-900">{result.courseName}</p>
                </div>
 