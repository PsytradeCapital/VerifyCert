import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface Certificate {
  id: string;
  recipientName: string;
  courseName: string;
  issuerName: string;
  issueDate: string;
  verified: boolean;
  description?: string;
}

export const CertificateViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock certificate data
        const mockCertificate: Certificate = {
          id: id || '1',
          recipientName: 'John Doe',
          courseName: 'Blockchain Development Certification',
          issuerName: 'Tech University',
          issueDate: '2024-01-15',
          verified: true,
          description: 'This certificate confirms successful completion of the Blockchain Development course.'
        };
        
        setCertificate(mockCertificate);
      } catch (err) {
        setError('Failed to load certificate');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCertificate();
  }, [id]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h2>
          <p className="text-gray-600">{error || 'The requested certificate could not be found.'}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Digital Certificate</h1>
          </div>
          
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">{certificate.courseName}</h2>
              {certificate.verified && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Recipient</h3>
                <p className="text-lg font-semibold text-gray-900">{certificate.recipientName}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Issuer</h3>
                <p className="text-lg font-semibold text-gray-900">{certificate.issuerName}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Issue Date</h3>
                <p className="text-lg font-semibold text-gray-900">{certificate.issueDate}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Certificate ID</h3>
                <p className="text-lg font-mono text-gray-900">{certificate.id}</p>
              </div>
            </div>
            
            {certificate.description && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Description</h3>
                <p className="text-gray-700">{certificate.description}</p>
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors">
                  Download Certificate
                </button>
                <button className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors">
                  Share Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateViewer;
