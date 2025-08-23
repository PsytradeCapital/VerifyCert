import React from 'react';
import { CertificateData } from './blockchainService';

export interface ShareOptions {
method?: 'native' | 'clipboard' | 'social';
  platform?: 'twitter' | 'linkedin' | 'facebook' | 'email' | 'copy';
  customMessage?: string;
  includeQR?: boolean;

export interface DownloadOptions {
}
}
}
  format?: 'png' | 'pdf' | 'json';
  quality?: number;
  includeQR?: boolean;
  includeVerificationInfo?: boolean;

export interface CertificateTemplate {
width: number;
  height: number;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  titleFont: string;
  bodyFont: string;
  accentColor: string;

const DEFAULT_TEMPLATE: CertificateTemplate = {
  width: 1200,
  height: 900,
  backgroundColor: '#ffffff',
  borderColor: '#2563eb',
  borderWidth: 6,
  titleFont: 'bold 48px Inter, Arial, sans-serif',
  bodyFont: '24px Inter, Arial, sans-serif',
  accentColor: '#1d4ed8'
};

class CertificateService {
  /**
   * Generate a professional certificate image
   */
  async generateCertificateImage(
    certificate: CertificateData,
    template: Partial<CertificateTemplate> = {}
  ): Promise<string> {
    const config = { ...DEFAULT_TEMPLATE, ...template };
    
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Canvas not supported');

        // Set canvas size
        canvas.width = config.width;
        canvas.height = config.height;

        // Background
        ctx.fillStyle = config.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Decorative border
        ctx.strokeStyle = config.borderColor;
        ctx.lineWidth = config.borderWidth;
        ctx.strokeRect(
          config.borderWidth / 2, 
          config.borderWidth / 2, 
          canvas.width - config.borderWidth, 
          canvas.height - config.borderWidth
        );

        // Inner decorative border
        ctx.strokeStyle = config.accentColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

        // Header decoration
        ctx.fillStyle = config.accentColor;
        ctx.fillRect(60, 60, canvas.width - 120, 4);

        // Title
        ctx.fillStyle = config.borderColor;
        ctx.font = config.titleFont;
        ctx.textAlign = 'center';
        ctx.fillText('Certificate of Completion', canvas.width / 2, 150);

        // Subtitle
        ctx.fillStyle = '#374151';
        ctx.font = '28px Inter, Arial, sans-serif';
        ctx.fillText('This certifies that', canvas.width / 2, 220);

        // Recipient name (highlighted)
        ctx.fillStyle = config.accentColor;
        ctx.font = 'bold 42px Inter, Arial, sans-serif';
        ctx.fillText(certificate.recipientName, canvas.width / 2, 300);

        // Achievement text
        ctx.fillStyle = '#374151';
        ctx.font = '28px Inter, Arial, sans-serif';
        ctx.fillText('has successfully completed', canvas.width / 2, 360);

        // Course name (highlighted)
        ctx.fillStyle = config.borderColor;
        ctx.font = 'bold 36px Inter, Arial, sans-serif';
        
        // Handle long course names by wrapping text
        const courseWords = certificate.courseName.split(' ');
        const maxWidth = canvas.width - 200;
        let line = '';
        let y = 430;
        
        for (let n = 0; n < courseWords.length; n++) {
          const testLine = line + courseWords[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, canvas.width / 2, y);
            line = courseWords[n] + ' ';
            y += 45;
          } else {
            line = testLine;
        ctx.fillText(line, canvas.width / 2, y);

        // Institution
        ctx.fillStyle = '#374151';
        ctx.font = '24px Inter, Arial, sans-serif';
        ctx.fillText(Issued by ${certificate.institutionName}, canvas.width / 2, y + 80);

        // Date
        const issueDate = new Date(certificate.issueDate * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        ctx.fillText(Date: ${issueDate}, canvas.width / 2, y + 120);

        // Footer decoration
        ctx.fillStyle = config.accentColor;
        ctx.fillRect(60, canvas.height - 120, canvas.width - 120, 4);

        // Verification info
        ctx.fillStyle = '#6b7280';
        ctx.font = '18px Inter, Arial, sans-serif';
        ctx.fillText('This certificate is verified on the blockchain', canvas.width / 2, canvas.height - 80);
        
        ctx.font = '14px Inter, Arial, sans-serif';
        ctx.fillText(Certificate ID: ${certificate.tokenId}, canvas.width / 2, canvas.height - 50);

        // Blockchain verification badge
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(canvas.width - 100, 100, 30, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter, Arial, sans-serif';
        ctx.fillText('✓', canvas.width - 100, 105);
        
        ctx.fillStyle = '#10b981';
        ctx.font = '10px Inter, Arial, sans-serif';
        ctx.fillText('VERIFIED', canvas.width - 100, 140);

        resolve(canvas.toDataURL('image/png', 1.0));
      } catch (error) {
        reject(error);
    });

  /**
   * Download certificate in specified format
   */
  async downloadCertificate(
    certificate: CertificateData,
    options: DownloadOptions = {}
  ): Promise<void> {
    const { format = 'png', quality = 1.0, includeVerificationInfo = true } = options;
    
    try {
      let downloadData: string;
      let filename: string;
      let mimeType: string;

      switch (format) {
        case 'png':
          downloadData = await this.generateCertificateImage(certificate);
          filename = certificate-${certificate.tokenId}-${certificate.recipientName.replace(/\s+/g, '-')}.png;
          mimeType = 'image/png';
          break;
          
        case 'pdf':
          // For PDF generation, we'd need a library like jsPDF
          // For now, we'll generate a high-quality PNG
          downloadData = await this.generateCertificateImage(certificate, { width: 1800, height: 1350 });
          filename = certificate-${certificate.tokenId}-${certificate.recipientName.replace(/\s+/g, '-')}.png;
          mimeType = 'image/png';
          break;
          
        case 'json':
          const certificateData = {
            ...certificate,
            downloadedAt: new Date().toISOString(),
            verificationURL: certificate.verificationURL,
            ...(includeVerificationInfo && {
              verificationInfo: {
                blockchain: 'Polygon Mumbai',
                contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
                verifiedAt: new Date().toISOString()
            })
          };
          downloadData = data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(certificateData, null, 2))};
          filename = certificate-${certificate.tokenId}-data.json;
          mimeType = 'application/json';
          break;
          
        default:
          throw new Error(Unsupported format: ${format});

      // Create and trigger download
      const link = document.createElement('a');
      link.href = downloadData;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Download failed:', error);
      throw new Error(Failed to download certificate: ${error instanceof Error ? error.message : 'Unknown error'});

  /**
   * Share certificate using various methods
   */
  async shareCertificate(
    certificate: CertificateData,
    options: ShareOptions = {}
  ): Promise<string> {
    const { platform = 'copy', customMessage } = options;
    
    const shareUrl = certificate.verificationURL || ${window.location.origin}/verify/${certificate.tokenId};
    const shareData = {
      title: Certificate: ${certificate.courseName},
      text: customMessage || ${certificate.recipientName} has completed ${certificate.courseName} from ${certificate.institutionName}. Verify this certificate on the blockchain.,
      url: shareUrl
    };

    try {
      if (platform === 'copy') {
        await this.copyToClipboard(shareUrl);
        return shareUrl;
      
      if (platform === 'email' || platform === 'twitter' || platform === 'linkedin' || platform === 'facebook') {
        await this.shareToSocialPlatform(shareData, platform);
        return shareUrl;
      
      // Native sharing fallback
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return shareUrl;
      } else {
        // Fallback to clipboard
        await this.copyToClipboard(shareUrl);
        return shareUrl;
    } catch (error) {
      console.error('Share failed:', error);
      throw new Error(Failed to share certificate: ${error instanceof Error ? error.message : 'Unknown error'});

  /**
   * Copy text to clipboard
   */
  private async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
      } finally {
        document.body.removeChild(textArea);

  /**
   * Share to social media platforms
   */
  private async shareToSocialPlatform(
    shareData: { title: string; text: string; url: string },
    platform: string
  ): Promise<void> {
    const encodedUrl = encodeURIComponent(shareData.url);
    const encodedText = encodeURIComponent(shareData.text);
    const encodedTitle = encodeURIComponent(shareData.title);
    
    let shareUrl: string;
    
    switch (platform) {
      case 'twitter':
        shareUrl = https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl};
        break;
        
      case 'linkedin':
        shareUrl = https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedText};
        break;
        
      case 'facebook':
        shareUrl = https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText};
        break;
        
      case 'email':
        shareUrl = mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl};
        break;
        
      default:
        throw new Error(Unsupported platform: ${platform});
    
    // Open in new window/tab
    const popup = window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    
    if (!popup) {
      throw new Error('Popup blocked. Please allow popups for this site to share on social media.');

  /**
   * Generate QR code for certificate verification
   */
  async generateQRCode(certificate: CertificateData, size: number = 200): Promise<string> {
    const verificationUrl = certificate.verificationURL || ${window.location.origin}/verify/${certificate.tokenId};
    
    // For now, we'll use a simple QR code service
    // In production, you might want to use a library like qrcode.js
    const qrApiUrl = https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(verificationUrl)};
    
    return qrApiUrl;

  /**
   * Create a shareable verification link with metadata
   */
  createVerificationLink(certificate: CertificateData, includeMetadata: boolean = false): string {
    const baseUrl = ${window.location.origin}/verify/${certificate.tokenId};
    
    if (!includeMetadata) {
      return baseUrl;
    
    const params = new URLSearchParams({
      recipient: certificate.recipientName,
      course: certificate.courseName,
      institution: certificate.institutionName,
      date: certificate.issueDate.toString()
    });
    
    return ${baseUrl}?${params.toString()};

  /**
   * Validate certificate data before operations
   */
  private validateCertificate(certificate: CertificateData): void {
    if (!certificate.tokenId) {
      throw new Error('Certificate ID is required');
    if (!certificate.recipientName) {
      throw new Error('Recipient name is required');
    if (!certificate.courseName) {
      throw new Error('Course name is required');
    if (!certificate.institutionName) {
      throw new Error('Institution name is required');

// Singleton instance
const certificateService = new CertificateService();

export default certificateService;
}
}