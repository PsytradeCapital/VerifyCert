import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Card from '../Card/Card';

export interface VerificationResult {
  id: string;
  status: 'verified' | 'error' | 'pending';
  message?: string;
  certificate?: {
    id: string;
    recipientName: string;
    courseName: string;
    institution: string;
    issueDate: string;
    isValid: boolean;
  };
}

export interface VerificationResultsProps {
  result: VerificationResult;
  onShare?: () => void;
  onDownload?: () => void;
  className?: string;
}

export const VerificationResults: React.FC<VerificationResultsProps> = ({
  result,
  onShare,
  onDownload,
  className = ''
}) => {
  const getStatusConfig = () => {
    switch (result.status) {
      case 'verified':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Certificate Verified'
        };
      case 'error':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Verification Failed'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Verification Pending'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className={`${config.bgColor} ${config.borderColor} border-2 p-6`}>
        {/* Status Header */}
        <div className="flex items-center mb-6">
          <div className={`p-3 rounded-full ${config.bgColor} mr-4`}>
            <Icon className={`w-8 h-8 ${config.color}`} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{config.title}</h3>
            {result.message && (
              <p className="text-gray-600 mt-1">{result.message}</p>
            )}
          </div>
        </div>

        {/* Certificate Details */}
        {result.status === 'verified' && result.certificate && (
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <label className="text-sm font-medium text-gray-500">Recipient</label>
                <p className="text-lg font-semibold text-gray-900">{result.certificate.recipientName}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <label className="text-sm font-medium text-gray-500">Course</label>
                <p className="text-lg font-semibold text-gray-900">{result.certificate.courseName}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <label className="text-sm font-medium text-gray-500">Institution</label>
                <p className="text-lg font-semibold text-gray-900">{result.certificate.institution}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <label className="text-sm font-medium text-gray-500">Issue Date</label>
                <p className="text-lg font-semibold text-gray-900">{result.certificate.issueDate}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {result.status === 'verified' && (onShare || onDownload) && (
          <div className="flex space-x-4">
            {onShare && (
              <button
                onClick={onShare}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Share Certificate
              </button>
            )}
            {onDownload && (
              <button
                onClick={onDownload}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Download Certificate
              </button>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
};