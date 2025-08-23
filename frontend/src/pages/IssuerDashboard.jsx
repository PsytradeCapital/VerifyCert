import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Award, Users, TrendingUp, Search } from 'lucide-react';
import CertificateCard from '../components/CertificateCard';
import LoadingButton from '../components/LoadingButton';
import { toast } from 'react-hot-toast';

const IssuerDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMintForm, setShowMintForm] = useState(false);
  const [stats, setStats] = useState({
    totalCertificates: 0,
    validCertificates: 0,
    revokedCertificates: 0
  });

  // Mint form state
  const [mintForm, setMintForm] = useState({
    recipientAddress: '',
    recipientName: '',
    courseName: '',
    institutionName: '',
    isLoading: false
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserCertificates();
    }
  }, [isAuthenticated]);

  const fetchUserCertificates = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/api/mint-certificate/user-certificates`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setCertificates(data.data.certificates);
        
        // Calculate stats
        const total = data.data.certificates.length;
        const valid = data.data.certificates.filter(cert => !cert.isRevoked).length;
        const revoked = total - valid;
        
        setStats({
          totalCertificates: total,
          validCertificates: valid,
          revokedCertificates: revoked
        });
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleMintFormChange = (e) => {
    const { name, value } = e.target;
    setMintForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMintCertificate = async (e) => {
    e.preventDefault();
    
    if (!mintForm.recipientAddress || !mintForm.recipientName || !mintForm.courseName || !mintForm.institutionName) {
      toast.error('Please fill in all fields');
      return;
    }

    setMintForm(prev => ({ ...prev, isLoading: true }));

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/api/mint-certificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientAddress: mintForm.recipientAddress,
          recipientName: mintForm.recipientName,
          courseName: mintForm.courseName,
          institutionName: mintForm.institutionName
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Certificate minted successfully! Token ID: ${data.data.tokenId}`);
        setMintForm({
          recipientAddress: '',
          recipientName: '',
          courseName: '',
          institutionName: '',
          isLoading: false
        });
        setShowMintForm(false);
        fetchUserCertificates(); // Refresh the list
      } else {
        throw new Error(data.details || data.error || 'Failed to mint certificate');
      }
    } catch (error) {
      console.error('Error minting certificate:', error);
      toast.error(error.message);
    } finally {
      setMintForm(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleRevokeCertificate = async (tokenId) => {
    try {
      // This would require implementing a revoke endpoint
      toast.info('Certificate revocation feature coming soon');
    } catch (error) {
      console.error('Error revoking certificate:', error);
      toast.error('Failed to revoke certificate');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access the issuer dashboard.</p>
          <a
            href="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Log In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Issuer Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
            </div>
            <button
              onClick={() => setShowMintForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Issue Certificate</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Certificates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCertificates}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valid Certificates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.validCertificates}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revoked Certificates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.revokedCertificates}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificates List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Your Certificates</h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : certificates.length === 0 ? (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
                <p className="text-gray-600 mb-4">Start by issuing your first certificate</p>
                <button
                  onClick={() => setShowMintForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Issue Certificate
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((cert) => (
                  <CertificateCard
                    key={cert.id}
                    certificate={{
                      recipientName: cert.recipientName,
                      courseName: cert.courseName,
                      institutionName: cert.institutionName,
                      issueDate: new Date(cert.createdAt).getTime() / 1000,
                      isRevoked: false,
                      issuer: cert.issuerAddress
                    }}
                    tokenId={cert.tokenId}
                    showActions={true}
                    onRevoke={handleRevokeCertificate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mint Certificate Modal */}
        {showMintForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Issue New Certificate</h2>
              
              <form onSubmit={handleMintCertificate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    name="recipientAddress"
                    value={mintForm.recipientAddress}
                    onChange={handleMintFormChange}
                    placeholder="0x..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    name="recipientName"
                    value={mintForm.recipientName}
                    onChange={handleMintFormChange}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Name
                  </label>
                  <input
                    type="text"
                    name="courseName"
                    value={mintForm.courseName}
                    onChange={handleMintFormChange}
                    placeholder="Blockchain Development"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institution Name
                  </label>
                  <input
                    type="text"
                    name="institutionName"
                    value={mintForm.institutionName}
                    onChange={handleMintFormChange}
                    placeholder="Tech University"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <LoadingButton
                    type="submit"
                    isLoading={mintForm.isLoading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Issue Certificate
                  </LoadingButton>
                  <button
                    type="button"
                    onClick={() => setShowMintForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                    disabled={mintForm.isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssuerDashboard;