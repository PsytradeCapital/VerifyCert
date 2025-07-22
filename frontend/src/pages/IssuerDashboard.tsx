import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import WalletConnect from '../components/WalletConnect';
import CertificateForm, { CertificateFormData } from '../components/CertificateForm';
import CertificateCard, { Certificate } from '../components/CertificateCard';

interface DashboardStats {
  totalIssued: number;
  thisMonth: number;
  thisWeek: number;
  activeRecipients: number;
}

interface WalletState {
  isConnected: boolean;
  address: string | null;
  provider: ethers.BrowserProvider | null;
}

export default function IssuerDashboard() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    provider: null,
  });

  const [issuedCertificates, setIssuedCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalIssued: 0,
    thisMonth: 0,
    thisWeek: 0,
    activeRecipients: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'course'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Handle wallet connection
  const handleWalletConnect = useCallback((address: string, provider: ethers.BrowserProvider) => {
    setWalletState({
      isConnected: true,
      address,
      provider,
    });
    toast.success('Wallet connected successfully!');
  }, []);

  // Handle wallet disconnection
  const handleWalletDisconnect = useCallback(() => {
    setWalletState({
      isConnected: false,
      address: null,
      provider: null,
    });
    setIssuedCertificates([]);
    setFilteredCertificates([]);
    setStats({
      totalIssued: 0,
      thisMonth: 0,
      thisWeek: 0,
      activeRecipients: 0,
    });
  }, []);

  // Fetch issued certificates for the connected wallet
  const fetchIssuedCertificates = useCallback(async () => {
    if (!walletState.isConnected || !walletState.address) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/certificates/issuer/${walletState.address}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setIssuedCertificates(data.data.certificates || []);
        calculateStats(data.data.certificates || []);
      } else {
        throw new Error(data.error?.message || 'Failed to fetch certificates');
      }
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
      toast.error('Failed to load issued certificates');
      setIssuedCertificates([]);
    } finally {
      setIsLoading(false);
    }
  }, [walletState.isConnected, walletState.address]);

  // Calculate dashboard statistics
  const calculateStats = (certificates: Certificate[]) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const thisWeek = certificates.filter(cert => 
      new Date(cert.issueDate * 1000) >= oneWeekAgo
    ).length;

    const thisMonth = certificates.filter(cert => 
      new Date(cert.issueDate * 1000) >= oneMonthAgo
    ).length;

    const uniqueRecipients = new Set(certificates.map(cert => cert.recipient)).size;

    setStats({
      totalIssued: certificates.length,
      thisMonth,
      thisWeek,
      activeRecipients: uniqueRecipients,
    });
  };

  // Handle certificate minting
  const handleCertificateMint = async (formData: CertificateFormData) => {
    if (!walletState.provider || !walletState.address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsMinting(true);
    try {
      // Prepare certificate data for minting
      const certificateData = {
        recipient: formData.recipientAddress,
        recipientName: formData.recipientName,
        courseName: formData.courseName,
        institutionName: formData.institutionName,
        issueDate: Math.floor(new Date(formData.issueDate).getTime() / 1000),
        description: formData.description || '',
        issuer: walletState.address,
      };

      // Call the minting API
      const response = await fetch('/api/v1/certificates/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(certificateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to mint certificate');
      }

      if (data.success) {
        toast.success('Certificate minted successfully!');
        
        // Refresh the certificates list
        await fetchIssuedCertificates();
      } else {
        throw new Error('Certificate minting failed');
      }
    } catch (error) {
      console.error('Minting error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to mint certificate');
    } finally {
      setIsMinting(false);
    }
  };

  // Filter and sort certificates
  useEffect(() => {
    let filtered = [...issuedCertificates];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(cert =>
        cert.recipientName.toLowerCase().includes(term) ||
        cert.courseName.toLowerCase().includes(term) ||
        cert.institutionName.toLowerCase().includes(term) ||
        cert.tokenId.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = a.recipientName.toLowerCase();
          bValue = b.recipientName.toLowerCase();
          break;
        case 'course':
          aValue = a.courseName.toLowerCase();
          bValue = b.courseName.toLowerCase();
          break;
        case 'date':
        default:
          aValue = a.issueDate;
          bValue = b.issueDate;
          break;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredCertificates(filtered);
  }, [issuedCertificates, searchTerm, sortBy, sortOrder]);

  // Fetch certificates when wallet connects
  useEffect(() => {
    if (walletState.isConnected) {
      fetchIssuedCertificates();
    }
  }, [walletState.isConnected, fetchIssuedCertificates]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Issuer Dashboard</h1>
              <p className="mt-1 text-gray-600">
                Manage and track your issued certificates
              </p>
            </div>
            <WalletConnect
              onConnect={handleWalletConnect}
              onDisconnect={handleWalletDisconnect}
              requiredNetwork="polygon-mumbai"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!walletState.isConnected ? (
          // Wallet not connected state
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Connect Your Wallet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Connect your MetaMask wallet to access the issuer dashboard and start issuing certificates.
              </p>
            </div>
          </div>
        ) : (
          // Connected state - show dashboard
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Issued</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalIssued}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">This Month</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.thisMonth}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">This Week</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.thisWeek}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Recipients</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.activeRecipients}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate Form */}
            <CertificateForm
              onSubmit={handleCertificateMint}
              isLoading={isMinting}
              walletAddress={walletState.address}
              isConnected={walletState.isConnected}
            />

            {/* Issued Certificates Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Issued Certificates</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {filteredCertificates.length} of {issuedCertificates.length} certificates
                    </p>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    {/* Search */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search certificates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>

                    {/* Sort */}
                    <div className="flex space-x-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'course')}
                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="date">Sort by Date</option>
                        <option value="name">Sort by Name</option>
                        <option value="course">Sort by Course</option>
                      </select>
                      
                      <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {sortOrder === 'asc' ? (
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {isLoading ? (
                  <div className="text-center py-12">
                    <svg className="animate-spin mx-auto h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">Loading certificates...</p>
                  </div>
                ) : filteredCertificates.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {searchTerm ? 'No certificates found' : 'No certificates issued yet'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm 
                        ? 'Try adjusting your search terms or filters.'
                        : 'Start by issuing your first certificate using the form above.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredCertificates.map((certificate) => (
                      <div key={certificate.tokenId} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">
                              {certificate.recipientName}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {certificate.courseName} • {formatDate(certificate.issueDate)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              certificate.isValid 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {certificate.isValid ? 'Valid' : 'Invalid'}
                            </span>
                            <span className="text-sm text-gray-500">#{certificate.tokenId}</span>
                          </div>
                        </div>
                        <CertificateCard
                          certificate={certificate}
                          showQR={false}
                          isPublicView={false}
                          className="border-0 shadow-none"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}