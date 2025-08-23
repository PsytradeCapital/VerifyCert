import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Check, AlertCircle, User, Award, Building, Calendar, FileText, Send } from 'lucide-react';
import { StepProgress } from '../Loading';
import { Button } from '../Button/Button';
import Card from '../Card/Card';

export interface CertificateFormData {
}
}
}
  recipientAddress: string;
  recipientName: string;
  courseName: string;
  institutionName: string;
  issueDate: string;
  description?: string;

interface CertificateWizardProps {
}
}
}
  onSubmit: (data: CertificateFormData) => Promise<void>;
  isLoading?: boolean;
  walletAddress?: string | null;
  isConnected?: boolean;
  className?: string;
  onCancel?: () => void;

interface FormErrors {
}
}
}
  recipientAddress?: string;
  recipientName?: string;
  courseName?: string;
  institutionName?: string;
  issueDate?: string;
  description?: string;

interface WizardStep {
}
}
}
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;

const wizardSteps: WizardStep[] = [
  {
    id: 'recipient',
    title: 'Recipient Info',
    description: 'Enter recipient details',
    icon: <User className="w-5 h-5" />,
  {
    id: 'certificate',
    title: 'Certificate Details',
    description: 'Course and achievement info',
    icon: <Award className="w-5 h-5" />,
  {
    id: 'institution',
    title: 'Institution Info',
    description: 'Issuing organization details',
    icon: <Building className="w-5 h-5" />,
  {
    id: 'metadata',
    title: 'Additional Info',
    description: 'Date and description',
    icon: <FileText className="w-5 h-5" />,
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Confirm and issue certificate',
    icon: <Send className="w-5 h-5" />
];

export default function CertificateWizard(): JSX.Element {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [formData, setFormData] = useState<CertificateFormData>({
    recipientAddress: '',
    recipientName: '',
    courseName: '',
    institutionName: '',
    issueDate: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const currentStep = wizardSteps[currentStepIndex];

  // Update institution name when wallet connects
  useEffect(() => {
    if (isConnected && walletAddress && !formData.institutionName) {
      setFormData(prev => ({
        ...prev,
        institutionName: 'My Institution',
      }));
  }, [isConnected, walletAddress, formData.institutionName]);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'recipientAddress':
        if (!value.trim()) {
          return 'Recipient address is required';
        if (!ethers.isAddress(value)) {
          return 'Please enter a valid Ethereum address';
        if (value.toLowerCase() === walletAddress?.toLowerCase()) {
          return 'Cannot issue certificate to yourself';
        break;

      case 'recipientName':
        if (!value.trim()) {
          return 'Recipient name is required';
        if (value.trim().length < 2) {
          return 'Name must be at least 2 characters long';
        if (value.trim().length > 100) {
          return 'Name must be less than 100 characters';
        break;

      case 'courseName':
        if (!value.trim()) {
          return 'Course/Achievement name is required';
        if (value.trim().length < 3) {
          return 'Course name must be at least 3 characters long';
        if (value.trim().length > 200) {
          return 'Course name must be less than 200 characters';
        break;

      case 'institutionName':
        if (!value.trim()) {
          return 'Institution name is required';
        if (value.trim().length < 2) {
          return 'Institution name must be at least 2 characters long';
        if (value.trim().length > 100) {
          return 'Institution name must be less than 100 characters';
        break;

      case 'issueDate':
        if (!value) {
          return 'Issue date is required';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate > today) {
          return 'Issue date cannot be in the future';
        break;

      case 'description':
        if (value && value.length > 500) {
          return 'Description must be less than 500 characters';
        break;

      default:
        break;
    return undefined;
  };

  const validateCurrentStep = (): boolean => {
    const stepFields: Record<string, string[]> = {
      recipient: ['recipientAddress', 'recipientName'],
      certificate: ['courseName'],
      institution: ['institutionName'],
      metadata: ['issueDate'],
      review: []
    };

    const fieldsToValidate = stepFields[currentStep.id] || [];
    const newErrors: FormErrors = {};
    let isValid = true;

    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field as keyof CertificateFormData] || '');
      if (error) {
        newErrors[field as keyof FormErrors] = error;
        isValid = false;
    });

    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  };

  const isFieldInvalid = (fieldName: string) => {
    return touched[fieldName] && errors[fieldName as keyof FormErrors];
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      toast.error('Please fix the errors before continuing');
      return;

    // Mark current step as completed
    if (!completedSteps.includes(currentStep.id)) {
      setCompletedSteps(prev => [...prev, currentStep.id]);

    if (currentStepIndex < wizardSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;

    // Validate all fields
    const allErrors: FormErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      if (key !== 'description') {
        const error = validateField(key, formData[key as keyof CertificateFormData] || '');
        if (error) {
          allErrors[key as keyof FormErrors] = error;
          isValid = false;
    });

    if (!isValid) {
      setErrors(allErrors);
      toast.error('Please fix all errors before submitting');
      return;

    try {
      await onSubmit(formData);
      
      // Reset form on successful submission
      setFormData({
        recipientAddress: '',
        recipientName: '',
        courseName: '',
        institutionName: formData.institutionName,
        issueDate: new Date().toISOString().split('T')[0],
        description: '',
      });
      setCurrentStepIndex(0);
      setCompletedSteps([]);
      setTouched({});
      setErrors({});
      
    } catch (error) {
      console.error('Form submission error:', error);
  };

  const renderStepContent = () => {
    const stepVariants = {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20
    };

    switch (currentStep.id) {
      case 'recipient':
        return (
          <motion.div
            key="recipient"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <User className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-gray-900">Recipient Information</h3>
              <p className="text-gray-600">Enter the details of the certificate recipient</p>
            </div>

            <div>
              <label htmlFor="recipientAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Wallet Address *
              </label>
              <input
                type="text"
                id="recipientAddress"
                name="recipientAddress"
                value={formData.recipientAddress}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="0x..."
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm transition-colors ${
                  isFieldInvalid('recipientAddress')
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {isFieldInvalid('recipientAddress') && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.recipientAddress}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Full Name *
              </label>
              <input
                type="text"
                id="recipientName"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter recipient's full name"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  isFieldInvalid('recipientName')
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {isFieldInvalid('recipientName') && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.recipientName}
                </p>
              )}
            </div>
          </motion.div>
        );

      case 'certificate':
        return (
          <motion.div
            key="certificate"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Award className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-gray-900">Certificate Details</h3>
              <p className="text-gray-600">Specify the course or achievement being certified</p>
            </div>

            <div>
              <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-2">
                Course/Achievement Name *
              </label>
              <input
                type="text"
                id="courseName"
                name="courseName"
                value={formData.courseName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="e.g., Blockchain Development Certification"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  isFieldInvalid('courseName')
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {isFieldInvalid('courseName') && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.courseName}
                </p>
              )}
            </div>
          </motion.div>
        );

      case 'institution':
        return (
          <motion.div
            key="institution"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Building className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-gray-900">Institution Information</h3>
              <p className="text-gray-600">Enter your organization details</p>
            </div>

            <div>
              <label htmlFor="institutionName" className="block text-sm font-medium text-gray-700 mb-2">
                Institution Name *
              </label>
              <input
                type="text"
                id="institutionName"
                name="institutionName"
                value={formData.institutionName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter your institution name"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  isFieldInvalid('institutionName')
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {isFieldInvalid('institutionName') && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.institutionName}
                </p>
              )}
            </div>
          </motion.div>
        );

      case 'metadata':
        return (
          <motion.div
            key="metadata"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <FileText className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-gray-900">Additional Information</h3>
              <p className="text-gray-600">Set the issue date and add optional description</p>
            </div>

            <div>
              <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-2">
                Issue Date *
              </label>
              <input
                type="date"
                id="issueDate"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleInputChange}
                onBlur={handleBlur}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  isFieldInvalid('issueDate')
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {isFieldInvalid('issueDate') && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.issueDate}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Additional details about the achievement..."
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical transition-colors ${
                  isFieldInvalid('description')
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {isFieldInvalid('description') && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.description}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                {formData.description?.length || 0}/500 characters
              </p>
            </div>
          </motion.div>
        );

      case 'review':
        return (
          <motion.div
            key="review"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Send className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-gray-900">Review & Submit</h3>
              <p className="text-gray-600">Please review all information before issuing the certificate</p>
            </div>

            <Card className="p-6 bg-gray-50">
              <h4 className="font-semibold text-gray-900 mb-4">Certificate Summary</h4>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Recipient:</span>
                  <span className="font-medium">{formData.recipientName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Wallet Address:</span>
                  <span className="font-mono text-sm">
                    {formData.recipientAddress.slice(0, 6)}...{formData.recipientAddress.slice(-4)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Course/Achievement:</span>
                  <span className="font-medium">{formData.courseName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Institution:</span>
                  <span className="font-medium">{formData.institutionName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Issue Date:</span>
                  <span className="font-medium">
                    {new Date(formData.issueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                {formData.description && (
                  <div>
                    <span className="text-gray-600">Description:</span>
                    <p className="mt-1 text-sm text-gray-800">{formData.description}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Wallet Status */}
            {!isConnected && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
                  <p className="text-sm text-yellow-800">
                    Please connect your wallet to issue certificates
                  </p>
                </div>
              </div>
            )}

            {isConnected && walletAddress && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-2" />
                  <div>
                    <p className="text-sm text-green-800 font-medium">Wallet Connected</p>
                    <p className="text-xs text-green-600 font-mono">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Important Notes</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Certificate will be minted as a non-transferable NFT</li>
                <li>• All information will be permanently stored on the blockchain</li>
                <li>• Recipients can verify authenticity using the generated QR code</li>
                <li>• Double-check all details as they cannot be modified after issuance</li>
              </ul>
            </div>
          </motion.div>
        );

      default:
        return null;
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Issue New Certificate</h2>
        <p className="text-gray-600 mt-1">
          Follow the steps below to create a blockchain-verified certificate
        </p>
      </div>

      {/* Step Progress */}
      <div className="px-6 py-6 border-b border-gray-200">
        <StepProgress
          steps={wizardSteps.map(step => ({
            id: step.id,
            title: step.title,
            description: step.description
          }))}
          currentStep={currentStep.id}
          completedSteps={completedSteps}
          orientation="horizontal"
          size="default"
        />
      </div>

      {/* Step Content */}
      <div className="px-6 py-8">
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
        <div>
          {currentStepIndex > 0 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isLoading}
              className="flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}

          {currentStepIndex < wizardSteps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="flex items-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isConnected || isLoading}
              className="flex items-center"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Minting Certificate...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Issue Certificate
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
}}}}}}}}}}}}}}}}}}}}}}}}}}}