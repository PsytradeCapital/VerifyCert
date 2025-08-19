import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import WalletConnect from '../components/WalletConnect';
import CertificateCard, { Certificate } from '../components/CertificateCard';
import { DashboardOverview, ActivityFeed, QuickStats, DashboardStats, ActivityItem, CertificateList, CertificateWizard, CertificateFormData } from '../components/ui';
import { demoDataService } from '../services/demoDataService';
import { useAuth } from '../contexts/AuthContext';

interface ExtendedDashboardStats extends DashboardStats {
  previousMonth: number;
  previousWeek: number;
  growthRate: number;

interface WalletState {
  isConnected: boolean;
  address: string | null;
  provider: ethers.BrowserProvider | null;

export default function IssuerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    provider: null,
  });

  // Determine if we're in demo mode
  const isDemoMode = !isAuthenticated && walletState.isConnected;

  const [issuedCertificates, setIssuedCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<ExtendedDashboardStats>({
    totalIssued: 0,
    thisMonth: 0,
    thisWeek: 0,
    activeRecipients: 0,
    previousMonth: 0,
    previousWeek: 0,
    growthRate: 0,
  });

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [quickStats, setQuickStats] = useState({
    verificationRate: 95,
    averageProcessingTime: '2.3s',
    successRate: 98,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

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
    setStats({
      totalIssued: 0,
      thisMonth: 0,
      thisWeek: 0,
      activeRecipients: 0,
      previousMonth: 0,
      previousWeek: 0,
      growthRate: 0,
    });
    setActivities([]);
  }, []);

  // Fetch issued certificates for the connected wallet or load demo data
  const fetchIssuedCertificates = useCallback(async () => {
    if (!walletState.isConnected || !walletState.address) return;

    setIsLoading(true);
    try {
      if (isDemoMode) {
        // Load demo data for non-authenticated users
        const demoData = demoDataService.getDemoData();
        setIssuedCertificates(demoData.certificates);
        setStats(demoData.stats);
        setActivities(demoData.activities);
        setQuickStats(demoData.quickStats);
        
        // Show demo mode notification
        toast.success('🚀 Demo Mode: Exploring with sample data. Create an account for full features!', {
          duration: 5000,
          position: 'top-center',
        });
      } else {
        // Load real data for authenticated users
        const response = await fetch(`/api/v1/certificates/issuer/${walletState.address}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setIssuedCertificates(data.data.certificates || []);
          calculateStats(data.data.certificates || []);
        } else {
          throw new Error(data.error?.message || 'Failed to fetch certificates');
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
      if (!isDemoMode) {
        toast.error('Failed to load issued certificates');
        setIssuedCertificates([]);
    } finally {
      setIsLoading(false);
  }, [walletState.isConnected, walletState.address, isDemoMode]);

  // Calculate dashboard statistics
  const calculateStats = (certificates: Certificate[]) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const thisWeek = certificates.filter(cert => 
      new Date(cert.issueDate * 1000) >= oneWeekAgo
    ).length;

    const thisMonth = certificates.filter(cert => 
      new Date(cert.issueDate * 1000) >= oneMonthAgo
    ).length;

    const previousWeek = certificates.filter(cert => {
      const date = new Date(cert.issueDate * 1000);
      return date >= twoWeeksAgo && date < oneWeekAgo;
    }).length;

    const previousMonth = certificates.filter(cert => {
      const date = new Date(cert.issueDate * 1000);
      return date >= twoMonthsAgo && date < oneMonthAgo;
    }).length;

    const uniqueRecipients = new Set(certificates.map(cert => cert.recipient)).size;
    const growthRate = previousMonth > 0 ? ((thisMonth - previousMonth) / previousMonth) * 100 : 0;

    setStats({
      totalIssued: certificates.length,
      thisMonth,
      thisWeek,
      activeRecipients: uniqueRecipients,
      previousMonth,
      previousWeek,
      growthRate: Math.round(growthRate),
    });

    // Generate activity feed from recent certificates
    const recentActivities: ActivityItem[] = certificates
      .sort((a, b) => b.issueDate - a.issueDate)
      .slice(0, 10)
      .map(cert => ({
        id: cert.tokenId,
        type: 'issued' as const,
        title: `Certificate issued to ${cert.recipientName}`,
        description: `${cert.courseName} - ${cert.institutionName}`,
        timestamp: new Date(cert.issueDate * 1000),
        recipient: cert.recipientName,
        certificateId: cert.tokenId,
      }));

    setActivities(recentActivities);
  };

  // Handle certificate minting
  const handleCertificateMint = async (formData: CertificateFormData) => {
    if (!walletState.provider || !walletState.address) {
      toast.error('Please connect your wallet first');
      return;

    setIsMinting(true);
    try {
      if (isDemoMode) {
        // Demo mode: simulate certificate creation
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
        
        const newDemoCertificate: Certificate = {
          tokenId: `demo-${Date.now()}`,
          issuer: walletState.address,
          recipient: formData.recipientAddress,
          recipientName: formData.recipientName,
          courseName: formData.courseName,
          institutionName: formData.institutionName,
          issueDate: Math.floor(Date.now() / 1000),
          isValid: true,
          qrCodeURL: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=demo-${Date.now()}`,
          verificationURL: `/verify/demo-${Date.now()}`,
        };

        // Add to demo certificates
        setIssuedCertificates(prev => [newDemoCertificate, ...prev]);
        
        // Add new activity
        const newActivity: ActivityItem = {
          id: newDemoCertificate.tokenId,
          type: 'issued',
          title: `Demo certificate issued to ${formData.recipientName}`,
          description: `${formData.courseName} - ${formData.institutionName}`,
          timestamp: new Date(),
          recipient: formData.recipientName,
          certificateId: newDemoCertificate.tokenId,
        };
        
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
        
        toast.success('🎯 Demo certificate created! Sign up for a full account to mint real blockchain certificates.', {
          duration: 6000,
        });
      } else {
        // Real mode: actual certificate minting
        const certificateData = {
          recipient: formData.recipientAddress,
          recipientName: formData.recipientName,
          courseName: formData.courseName,
          institutionName: formData.institutionName,
          issueDate: Math.floor(new Date(formData.issueDate).getTime() / 1000),
          description: formData.description || '',
          issuer: walletState.address,
        };

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

        if (data.success) {
          toast.success('Certificate minted successfully!');
          
          const newActivity: ActivityItem = {
            id: data.tokenId || Date.now().toString(),
            type: 'issued',
            title: `Certificate issued to ${formData.recipientName}`,
            description: `${formData.courseName} - ${formData.institutionName}`,
            timestamp: new Date(),
            recipient: formData.recipientName,
            certificateId: data.tokenId,
          };
          
          setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
          await fetchIssuedCertificates();
        } else {
          throw new Error('Certificate minting failed');
    } catch (error) {
      console.error('Minting error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to mint certificate');
    } finally {
      setIsMinting(false);
  };

  // Handle certificate actions
  const handleCertificateAction = useCallback(async (action: string, certificate: Certificate) => {
    switch (action) {
      case 'view':
        // Navigate to certificate view page or open modal
        window.open(`/verify/${certificate.tokenId}`, '_blank');
        break;
      
      case 'download':
        try {
          // Use the certificate service to download
          const certificateService = (await import('../services/certificateService')).default;
          await certificateService.downloadCertificate(certificate, { format: 'png' });
          toast.success('Certificate downloaded successfully!');
        } catch (error) {
          console.error('Download failed:', error);
          toast.error('Failed to download certificate');
        break;
      
      case 'share':
        try {
          // Use the certificate service to share
          const certificateService = (await import('../services/certificateService')).default;
          await certificateService.shareCertificate(certificate, { platform: 'copy' });
          toast.success('Certificate link copied to clipboard!');
        } catch (error) {
          console.error('Share failed:', error);
          toast.error('Failed to share certificate');
        break;
      
      default:
        console.warn(`Unknown certificate action: ${action}`);
  }, []);

  // Fetch certificates when wallet connects
  useEffect(() => {
    if (walletState.isConnected) {
      fetchIssuedCertificates();
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
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">Issuer Dashboard</h1>
                {isDemoMode && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    🚀 Demo Mode
                  </span>
                )}
              </div>
              <p className="mt-1 text-gray-600">
                {isDemoMode 
                  ? 'Exploring with sample data - Create an account for full features!'
                  : 'Manage and track your issued certificates'
              </p>
              {isDemoMode && (
                <div className="mt-2">
                  <button
                    onClick={() => window.location.href = '/signup'}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    Upgrade to Full Account
                  </button>
                </div>
              )}
            </div>
            <WalletConnect
              onConnect={handleWalletConnect}
              onDisconnect={handleWalletDisconnect}
              requiredNetwork="polygon-amoy"
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
            {/* Enhanced Dashboard Overview */}
            <DashboardOverview 
              stats={stats} 
              isLoading={isLoading}
            />

            {/* Additional Dashboard Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ActivityFeed 
                  activities={activities}
                  isLoading={isLoading}
                  maxItems={5}
                />
              </div>
              <div>
                <QuickStats 
                  verificationRate={quickStats.verificationRate}
                  averageProcessingTime={quickStats.averageProcessingTime}
                  successRate={quickStats.successRate}
                  isLoading={isLoading}
                />
              </div>
            </div>

            {/* Certificate Wizard */}
            <CertificateWizard
              onSubmit={handleCertificateMint}
              isLoading={isMinting}
              walletAddress={walletState.address}
              isConnected={walletState.isConnected}
            />

            {/* Enhanced Certificate List */}
            <CertificateList
              certificates={issuedCertificates}
              isLoading={isLoading}
              showBulkActions={true}
              onCertificateAction={handleCertificateAction}
            />
          </div>
        )}
      </div>
    </div>
  );