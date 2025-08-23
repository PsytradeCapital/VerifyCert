import React from 'react';
import { Certificate } from '../components/CertificateCard';

export interface DemoStats {
}
}
}
  totalIssued: number;
  thisMonth: number;
  thisWeek: number;
  activeRecipients: number;
  previousMonth: number;
  previousWeek: number;
  growthRate: number;

export interface DemoActivity {
}
}
}
  id: string;
  type: 'issued' | 'verified' | 'revoked';
  title: string;
  description: string;
  timestamp: Date;
  recipient: string;
  certificateId: string;

export interface DemoQuickStats {
}
}
}
  verificationRate: number;
  averageProcessingTime: string;
  successRate: number;

export class DemoDataService {
  private static instance: DemoDataService;
  private demoData: {
    certificates: Certificate[];
    stats: DemoStats;
    activities: DemoActivity[];
    quickStats: DemoQuickStats;
  } | null = null;

  static getInstance(): DemoDataService {
    if (!DemoDataService.instance) {
      DemoDataService.instance = new DemoDataService();
    return DemoDataService.instance;

  generateSampleCertificates(): Certificate[] {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    return [
      {
        tokenId: 'demo-001',
        issuer: '0x1234567890123456789012345678901234567890',
        recipient: '0x2345678901234567890123456789012345678901',
        recipientName: 'Alice Johnson',
        courseName: 'Advanced Blockchain Development',
        institutionName: 'Tech University',
        issueDate: Math.floor((now - 2 * oneDay) / 1000),
        isValid: true,
        qrCodeURL: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=demo-001',
        verificationURL: '/verify/demo-001',
      },
      {
        tokenId: 'demo-002',
        issuer: '0x1234567890123456789012345678901234567890',
        recipient: '0x3456789012345678901234567890123456789012',
        recipientName: 'Bob Smith',
        courseName: 'Smart Contract Security',
        institutionName: 'Blockchain Institute',
        issueDate: Math.floor((now - 5 * oneDay) / 1000),
        isValid: true,
        qrCodeURL: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=demo-002',
        verificationURL: '/verify/demo-002',
      },
      {
        tokenId: 'demo-003',
        issuer: '0x1234567890123456789012345678901234567890',
        recipient: '0x4567890123456789012345678901234567890123',
        recipientName: 'Carol Davis',
        courseName: 'DeFi Fundamentals',
        institutionName: 'Crypto Academy',
        issueDate: Math.floor((now - oneWeek) / 1000),
        isValid: true,
        qrCodeURL: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=demo-003',
        verificationURL: '/verify/demo-003',
      },
      {
        tokenId: 'demo-004',
        issuer: '0x1234567890123456789012345678901234567890',
        recipient: '0x5678901234567890123456789012345678901234',
        recipientName: 'David Wilson',
        courseName: 'NFT Development Workshop',
        institutionName: 'Digital Arts College',
        issueDate: Math.floor((now - 2 * oneWeek) / 1000),
        isValid: true,
        qrCodeURL: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=demo-004',
        verificationURL: '/verify/demo-004',
      },
      {
        tokenId: 'demo-005',
        issuer: '0x1234567890123456789012345678901234567890',
        recipient: '0x6789012345678901234567890123456789012345',
        recipientName: 'Eva Martinez',
        courseName: 'Web3 Frontend Development',
        institutionName: 'Code Academy',
        issueDate: Math.floor((now - oneMonth) / 1000),
        isValid: true,
        qrCodeURL: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=demo-005',
        verificationURL: '/verify/demo-005',
      },
      {
        tokenId: 'demo-006',
        issuer: '0x1234567890123456789012345678901234567890',
        recipient: '0x7890123456789012345678901234567890123456',
        recipientName: 'Frank Thompson',
        courseName: 'Cryptocurrency Trading',
        institutionName: 'Finance Institute',
        issueDate: Math.floor((now - oneMonth - oneWeek) / 1000),
        isValid: true,
        qrCodeURL: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=demo-006',
        verificationURL: '/verify/demo-006',
      },
    ];

  generateSampleStats(certificates: Certificate[]): DemoStats {
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const oneMonth = 30 * 24 * 60 * 60 * 1000;

    const thisWeek = certificates.filter(cert => 
      (now - cert.issueDate * 1000) <= oneWeek
    ).length;

    const thisMonth = certificates.filter(cert => 
      (now - cert.issueDate * 1000) <= oneMonth
    ).length;

    const previousWeek = certificates.filter(cert => {
      const age = now - cert.issueDate * 1000;
      return age > oneWeek && age <= 2 * oneWeek;
    }).length;

    const previousMonth = certificates.filter(cert => {
      const age = now - cert.issueDate * 1000;
      return age > oneMonth && age <= 2 * oneMonth;
    }).length;

    const uniqueRecipients = new Set(certificates.map(cert => cert.recipient)).size;
    const growthRate = previousMonth > 0 ? ((thisMonth - previousMonth) / previousMonth) * 100 : 0;

    return {
      totalIssued: certificates.length,
      thisMonth,
      thisWeek,
      activeRecipients: uniqueRecipients,
      previousMonth,
      previousWeek,
      growthRate: Math.round(growthRate),
    };

  generateSampleActivities(certificates: Certificate[]): DemoActivity[] {
    return certificates
      .sort((a, b) => b.issueDate - a.issueDate)
      .slice(0, 8)
      .map(cert => ({
        id: cert.tokenId,
        type: 'issued' as const,
        title: `Certificate issued to ${cert.recipientName}`,
        description: `${cert.courseName} - ${cert.institutionName}`,
        timestamp: new Date(cert.issueDate * 1000),
        recipient: cert.recipientName,
        certificateId: cert.tokenId,
      }))
      .concat([
        {
          id: 'demo-verify-001',
          type: 'verified' as const,
          title: 'Certificate verified by employer',
          description: 'Advanced Blockchain Development - Tech University',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          recipient: 'Alice Johnson',
          certificateId: 'demo-001',
        },
        {
          id: 'demo-verify-002',
          type: 'verified' as const,
          title: 'Certificate verified by recruiter',
          description: 'Smart Contract Security - Blockchain Institute',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          recipient: 'Bob Smith',
          certificateId: 'demo-002',
        },
      ])
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

  generateQuickStats(): DemoQuickStats {
    return {
      verificationRate: 96,
      averageProcessingTime: '1.8s',
      successRate: 99,
    };

  getDemoData() {
    if (!this.demoData) {
      const certificates = this.generateSampleCertificates();
      this.demoData = {
        certificates,
        stats: this.generateSampleStats(certificates),
        activities: this.generateSampleActivities(certificates),
        quickStats: this.generateQuickStats(),
      };
    return this.demoData;

  isDemoMode(walletAddress: string | null): boolean {
    // Check if user is in demo mode (wallet connected but no authenticated account)
    // This is a simple check - in production you might want more sophisticated logic
    return walletAddress !== null && !this.hasAuthenticatedAccount();

  private hasAuthenticatedAccount(): boolean {
    // Check if user has a full authenticated account
    // This would typically check authentication context or local storage
    try {
      const authData = localStorage.getItem('auth');
      return authData !== null && JSON.parse(authData).isAuthenticated === true;
    } catch {
      return false;

  clearDemoData(): void {
    this.demoData = null;

export const demoDataService = DemoDataService.getInstance();
}
}}}}}}