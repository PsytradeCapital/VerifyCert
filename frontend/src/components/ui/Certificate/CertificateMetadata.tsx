import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Building,
  User,
  Award,
  Shield,
  Hash,
  Clock,
  MapPin,
  BookOpen,
  Star,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Info
} from 'lucide-react';
import Tooltip from '../Tooltip/Tooltip';

export interface CertificateMetadata {
  // Core Information
  tokenId: string;
  issuer: string;
  recipient: string;
  recipientName: string;
  courseName: string;
  institutionName: string;
  issueDate: number;
  
  // Extended Information
  certificateType?: string;
  grade?: string;
  credits?: number;
  duration?: string;
  description?: string;
  instructorName?: string;
  location?: string;
  completionDate?: number;
  expiryDate?: number;
  
  // Blockchain Information
  blockNumber?: number;
  transactionHash?: string;
  networkName?: string;
  
  // Additional Metadata
  skills?: string[];
  prerequisites?: string[];
  learningOutcomes?: string[];
  assessmentMethods?: string[];
}

interface CertificateMetadataProps {
  metadata: CertificateMetadata;
  variant?: 'default' | 'compact' | 'detailed';
  showBlockchainInfo?: boolean;
  showExtendedInfo?: boolean;
  collapsible?: boolean;
  className?: string;
}

const CertificateMetadata: React.FC<CertificateMetadataProps> = ({
  metadata,
  variant = 'default',
  showBlockchainInfo = true,
  showExtendedInfo = true,
  collapsible = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(!collapsible);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const MetadataField: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    copyable?: boolean;
    tooltip?: string;
    link?: string;
  }> = ({ icon, label, value, copyable = false, tooltip, link }) => (
    <div className="flex items-start space-x-3 group">
      <div className="flex-shrink-0 mt-1">
        {tooltip ? (
          <Tooltip content={tooltip}>
            <div className="text-neutral-400 group-hover:text-neutral-600 transition-colors">
              {icon}
            </div>
          </Tooltip>
        ) : (
          <div className="text-neutral-400 group-hover:text-neutral-600 transition-colors">
            {icon}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <label className="block text-sm font-medium text-neutral-500 mb-1">
          {label}
        </label>
        <div className="flex items-center space-x-2">
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-medium text-primary-600 hover:text-primary-700 transition-colors break-all"
            >
              {value}
            </a>
          ) : (
            <p className="text-lg font-medium text-neutral-900 break-all">
              {value}
            </p>
          )}
          {copyable && (
            <button
              onClick={() => copyToClipboard(String(value), label)}
              className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded"
              title={`Copy ${label}`}
            >
              {copiedField === label ? (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-green-500"
                >
                  ✓
                </motion.div>
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          )}
          {link && (
            <ExternalLink className="h-4 w-4 text-neutral-400" />
          )}
        </div>
      </div>
    </div>
  );

  const MetadataSection: React.FC<{
    title: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
  }> = ({ title, children, icon }) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200">
        {icon && <div className="text-neutral-600">{icon}</div>}
        <h4 className="text-lg font-semibold text-neutral-900">{title}</h4>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const TagList: React.FC<{ items: string[]; title: string }> = ({ items, title }) => (
    <div>
      <label className="block text-sm font-medium text-neutral-500 mb-2">{title}</label>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700 border border-primary-200"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );

  if (variant === 'compact') {
    return (
      <div className={`bg-neutral-50 rounded-lg p-4 ${className}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetadataField
            icon={<Calendar className="h-4 w-4" />}
            label="Issue Date"
            value={formatDate(metadata.issueDate)}
          />
          <MetadataField
            icon={<Building className="h-4 w-4" />}
            label="Institution"
            value={metadata.institutionName}
          />
          <MetadataField
            icon={<Hash className="h-4 w-4" />}
            label="Certificate ID"
            value={metadata.tokenId}
            copyable
          />
          {metadata.grade && (
            <MetadataField
              icon={<Star className="h-4 w-4" />}
              label="Grade"
              value={metadata.grade}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-neutral-200 ${className}`}>
      {collapsible && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-neutral-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Info className="h-5 w-5 text-neutral-400" />
            <h3 className="text-lg font-semibold text-neutral-900">Certificate Information</h3>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-neutral-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-neutral-400" />
          )}
        </button>
      )}

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-8">
              {/* Core Information */}
              <MetadataSection title="Certificate Details" icon={<Award className="h-5 w-5" />}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <MetadataField
                    icon={<User className="h-5 w-5" />}
                    label="Recipient"
                    value={metadata.recipientName}
                  />
                  <MetadataField
                    icon={<BookOpen className="h-5 w-5" />}
                    label="Course"
                    value={metadata.courseName}
                  />
                  <MetadataField
                    icon={<Building className="h-5 w-5" />}
                    label="Institution"
                    value={metadata.institutionName}
                  />
                  <MetadataField
                    icon={<Calendar className="h-5 w-5" />}
                    label="Issue Date"
                    value={formatDate(metadata.issueDate)}
                  />
                  {metadata.certificateType && (
                    <MetadataField
                      icon={<Award className="h-5 w-5" />}
                      label="Type"
                      value={metadata.certificateType}
                    />
                  )}
                  {metadata.grade && (
                    <MetadataField
                      icon={<Star className="h-5 w-5" />}
                      label="Grade"
                      value={metadata.grade}
                    />
                  )}
                </div>
              </MetadataSection>

              {/* Extended Information */}
              {showExtendedInfo && (
                <>
                  {(metadata.credits || metadata.duration || metadata.instructorName || metadata.location) && (
                    <MetadataSection title="Course Details" icon={<BookOpen className="h-5 w-5" />}>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {metadata.credits && (
                          <MetadataField
                            icon={<Shield className="h-5 w-5" />}
                            label="Credits"
                            value={`${metadata.credits} Credits`}
                          />
                        )}
                        {metadata.duration && (
                          <MetadataField
                            icon={<Clock className="h-5 w-5" />}
                            label="Duration"
                            value={metadata.duration}
                          />
                        )}
                        {metadata.instructorName && (
                          <MetadataField
                            icon={<User className="h-5 w-5" />}
                            label="Instructor"
                            value={metadata.instructorName}
                          />
                        )}
                        {metadata.location && (
                          <MetadataField
                            icon={<MapPin className="h-5 w-5" />}
                            label="Location"
                            value={metadata.location}
                          />
                        )}
                        {metadata.completionDate && (
                          <MetadataField
                            icon={<Calendar className="h-5 w-5" />}
                            label="Completion Date"
                            value={formatDate(metadata.completionDate)}
                          />
                        )}
                        {metadata.expiryDate && (
                          <MetadataField
                            icon={<Calendar className="h-5 w-5" />}
                            label="Expiry Date"
                            value={formatDate(metadata.expiryDate)}
                          />
                        )}
                      </div>
                    </MetadataSection>
                  )}

                  {metadata.description && (
                    <MetadataSection title="Description">
                      <div className="prose prose-neutral max-w-none">
                        <p className="text-neutral-700 leading-relaxed">{metadata.description}</p>
                      </div>
                    </MetadataSection>
                  )}

                  {/* Skills and Learning Outcomes */}
                  {(metadata.skills || metadata.learningOutcomes || metadata.prerequisites || metadata.assessmentMethods) && (
                    <MetadataSection title="Learning Information" icon={<BookOpen className="h-5 w-5" />}>
                      <div className="space-y-6">
                        {metadata.skills && metadata.skills.length > 0 && (
                          <TagList items={metadata.skills} title="Skills Acquired" />
                        )}
                        {metadata.learningOutcomes && metadata.learningOutcomes.length > 0 && (
                          <TagList items={metadata.learningOutcomes} title="Learning Outcomes" />
                        )}
                        {metadata.prerequisites && metadata.prerequisites.length > 0 && (
                          <TagList items={metadata.prerequisites} title="Prerequisites" />
                        )}
                        {metadata.assessmentMethods && metadata.assessmentMethods.length > 0 && (
                          <TagList items={metadata.assessmentMethods} title="Assessment Methods" />
                        )}
                      </div>
                    </MetadataSection>
                  )}
                </>
              )}

              {/* Blockchain Information */}
              {showBlockchainInfo && (
                <MetadataSection title="Blockchain Verification" icon={<Shield className="h-5 w-5" />}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <MetadataField
                      icon={<Hash className="h-5 w-5" />}
                      label="Certificate ID"
                      value={metadata.tokenId}
                      copyable
                      tooltip="Unique identifier for this certificate on the blockchain"
                    />
                    <MetadataField
                      icon={<User className="h-5 w-5" />}
                      label="Issuer Address"
                      value={formatAddress(metadata.issuer)}
                      copyable
                      tooltip="Blockchain address of the certificate issuer"
                    />
                    <MetadataField
                      icon={<User className="h-5 w-5" />}
                      label="Recipient Address"
                      value={formatAddress(metadata.recipient)}
                      copyable
                      tooltip="Blockchain address of the certificate recipient"
                    />
                    {metadata.networkName && (
                      <MetadataField
                        icon={<Shield className="h-5 w-5" />}
                        label="Network"
                        value={metadata.networkName}
                        tooltip="Blockchain network where this certificate is stored"
                      />
                    )}
                    {metadata.blockNumber && (
                      <MetadataField
                        icon={<Hash className="h-5 w-5" />}
                        label="Block Number"
                        value={metadata.blockNumber.toString()}
                        tooltip="Block number where this certificate was minted"
                      />
                    )}
                    {metadata.transactionHash && (
                      <MetadataField
                        icon={<Hash className="h-5 w-5" />}
                        label="Transaction Hash"
                        value={formatAddress(metadata.transactionHash)}
                        copyable
                        tooltip="Transaction hash of the certificate minting"
                        link={`https://mumbai.polygonscan.com/tx/${metadata.transactionHash}`}
                      />
                    )}
                  </div>
                </MetadataSection>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CertificateMetadata;