import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

export interface CertificateFormData {
  recipientAddress: string;
  recipientName: string;
  courseName: string;
  institutionName: string;
  issueDate: string;
  description?: string;

interface CertificateFormProps {
  onSubmit: (data: CertificateFormData) => Promise<void>;
  isLoading?: boolean;
  walletAddress?: string | null;
  isConnected?: boolean;
  className?: string;

interface FormErrors {
  recipientAddress?: string;
  recipientName?: string;
  courseName?: string;
  institutionName?: string;
  issueDate?: string;
  description?: string;

export default function CertificateForm({
  onSubmit,
  isLoading = false,
  walletAddress = null,
  isConnected = false,
  className = '',
}: CertificateFormProps) {
  const [formData, setFormData] = useState<CertificateFormData>({
    recipientAddress: '',
    recipientName: '',
    courseName: '',
    institutionName: '',
    issueDate: new Date().toISOString().split('T')[0], // Today's date
    description: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Update institution name when wallet connects
  useEffect(() => {
    if (isConnected && walletAddress && !formData.institutionName) {
      setFormData(prev => ({
        ...prev,
        institutionName: 'My Institution', // Default value, user can change
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate all required fields
    Object.keys(formData).forEach(key => {
      if (key !== 'description') { // description is optional
        const error = validateField(key, formData[key as keyof CertificateFormData] || '');
        if (error) {
          newErrors[key as keyof FormErrors] = error;
          isValid = false;
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;

    try {
      await onSubmit(formData);
      
      // Reset form on successful submission
      setFormData({
        recipientAddress: '',
        recipientName: '',
        courseName: '',
        institutionName: formData.institutionName, // Keep institution name
        issueDate: new Date().toISOString().split('T')[0],
        description: '',
      });
      setTouched({});
      setErrors({});
      
    } catch (error) {
      console.error('Form submission error:', error);
      // Error handling is done in the parent component
  };

  const isFieldInvalid = (fieldName: string) => {
    return touched[fieldName] && errors[fieldName as keyof FormErrors];
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Issue New Certificate</h2>
        <p className="text-gray-600">
          Create a blockchain-verified certificate that cannot be forged or duplicated.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipient Address */}
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
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
              isFieldInvalid('recipientAddress')
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {isFieldInvalid('recipientAddress') && (
            <p className="mt-1 text-sm text-red-600">{errors.recipientAddress}</p>
          )}
        </div>

        {/* Recipient Name */}
        <div>
          <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Name *
          </label>
          <input
            type="text"
            id="recipientName"
            name="recipientName"
            value={formData.recipientName}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="Enter recipient's full name"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isFieldInvalid('recipientName')
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {isFieldInvalid('recipientName') && (
            <p className="mt-1 text-sm text-red-600">{errors.recipientName}</p>
          )}
        </div>

        {/* Course Name */}
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
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isFieldInvalid('courseName')
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {isFieldInvalid('courseName') && (
            <p className="mt-1 text-sm text-red-600">{errors.courseName}</p>
          )}
        </div>

        {/* Institution Name */}
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
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isFieldInvalid('institutionName')
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {isFieldInvalid('institutionName') && (
            <p className="mt-1 text-sm text-red-600">{errors.institutionName}</p>
          )}
        </div>

        {/* Issue Date */}
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
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isFieldInvalid('issueDate')
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {isFieldInvalid('issueDate') && (
            <p className="mt-1 text-sm text-red-600">{errors.issueDate}</p>
          )}
        </div>

        {/* Description (Optional) */}
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
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
              isFieldInvalid('description')
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {isFieldInvalid('description') && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formData.description?.length || 0}/500 characters
          </p>
        </div>

        {/* Wallet Status */}
        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-yellow-800">
                Please connect your wallet to issue certificates
              </p>
            </div>
          </div>
        )}

        {/* Connected Wallet Info */}
        {isConnected && walletAddress && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-green-800 font-medium">Wallet Connected</p>
                <p className="text-xs text-green-600 font-mono">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={!isConnected || isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              !isConnected || isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Minting Certificate...
              </div>
            ) : (
              'Issue Certificate'
            )}
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Tips for Certificate Issuance</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ensure the recipient's wallet address is correct - certificates cannot be transferred</li>
          <li>• Double-check all information as it will be permanently stored on the blockchain</li>
          <li>• The certificate will be minted as a non-transferable NFT</li>
          <li>• Recipients can verify authenticity using the generated QR code</li>
        </ul>
      </div>
    </div>
  );