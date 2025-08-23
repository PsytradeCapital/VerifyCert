import { blockchainService, CertificateData } from './blockchainService';

interface CertificateMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

interface Certificate extends CertificateData {
  id: string;
  metadata?: CertificateMetadata;
}

class CertificateService {
  async verifyCertificate(tokenId: string): Promise<Certificate | null> {
    try {
      const certificateData = await blockchainService.verifyCertificate(tokenId);
      
      if (!certificateData) {
        return null;
      }

      const certificate: Certificate = {
        id: tokenId,
        ...certificateData
      };

      return certificate;
    } catch (error) {
      console.error('Failed to verify certificate:', error);
      throw error;
    }
  }

  async mintCertificate(certificateData: {
    recipientAddress: string;
    recipientName: string;
    courseName: string;
    institutionName: string;
    description?: string;
    imageUrl?: string;
  }): Promise<string> {
    try {
      // Mock implementation for now
      return 'mock-tx-hash';
    } catch (error) {
      console.error('Failed to mint certificate:', error);
      throw error;
    }
  }

  generateCertificateUrl(tokenId: string): string {
    return `${window.location.origin}/verify/${tokenId}`;
  }

  generateQRCodeData(tokenId: string): string {
    return this.generateCertificateUrl(tokenId);
  }
}

export const certificateService = new CertificateService();
export type { Certificate, CertificateMetadata };