const NotificationService = require('../services/NotificationService');
const nodemailer = require('nodemailer');

// Mock nodemailer
jest.mock('nodemailer');

describe('NotificationService', () => {
  let notificationService;
  let mockTransporter;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock transporter
    mockTransporter = {
      verify: jest.fn().mockResolvedValue(true),
      sendMail: jest.fn().mockResolvedValue({
        messageId: 'test-message-id',
        response: '250 OK'
      })
    };

    // Mock nodemailer methods
    nodemailer.createTransport = jest.fn().mockReturnValue(mockTransporter);
    nodemailer.createTestAccount = jest.fn().mockResolvedValue({
      user: 'test@ethereal.email',
      pass: 'testpass'
    });
    nodemailer.getTestMessageUrl = jest.fn().mockReturnValue('https://ethereal.email/message/test');

    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.FRONTEND_URL = 'http://localhost:3000';
    process.env.FROM_NAME = 'VerifyCert Test';
    process.env.FROM_EMAIL = 'test@verifycert.com';

    notificationService = new NotificationService();
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.FRONTEND_URL;
    delete process.env.FROM_NAME;
    delete process.env.FROM_EMAIL;
  });

  describe('constructor and initialization', () => {
    it('should initialize transporter on construction', async () => {
      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(nodemailer.createTestAccount).toHaveBeenCalled();
      expect(nodemailer.createTransport).toHaveBeenCalled();
      expect(mockTransporter.verify).toHaveBeenCalled();
    });

    it('should use production SMTP settings when provided', async () => {
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'test@gmail.com';
      process.env.SMTP_PASS = 'password';
      process.env.NODE_ENV = 'production';

      new NotificationService();
      
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@gmail.com',
          pass: 'password'
        }
      });
    });

    it('should handle transporter initialization failure gracefully', async () => {
      mockTransporter.verify.mockRejectedValue(new Error('Connection failed'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      new NotificationService();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to initialize email transporter:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('sendCertificateDelivery', () => {
    const mockCertificateData = {
      tokenId: '123',
      recipientName: 'John Doe',
      courseName: 'Blockchain Development',
      institutionName: 'Tech University',
      issueDate: 1640995200, // 2022-01-01 timestamp
      issuer: '0x1234567890123456789012345678901234567890'
    };

    const mockQRData = {
      qrImageURL: '/path/to/qr-code.png',
      verificationURL: 'http://localhost:3000/verify/123'
    };

    beforeEach(async () => {
      // Ensure service is initialized
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should send certificate delivery email successfully', async () => {
      const result = await notificationService.sendCertificateDelivery(
        mockCertificateData,
        'recipient@example.com',
        mockQRData
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        messageId: 'test-message-id',
        recipientEmail: 'recipient@example.com',
        certificateId: '123',
        previewURL: 'https://ethereal.email/message/test'
      });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: '"VerifyCert Test" <test@verifycert.com>',
        to: 'recipient@example.com',
        subject: 'Your Certificate: Blockchain Development',
        html: expect.stringContaining('John Doe'),
        text: expect.stringContaining('John Doe'),
        attachments: [{
          filename: 'certificate-qr-123.png',
          path: '/path/to/qr-code.png',
          cid: 'qrcode'
        }]
      });
    });

    it('should send email without QR code attachment when QR data is not provided', async () => {
      const result = await notificationService.sendCertificateDelivery(
        mockCertificateData,
        'recipient@example.com',
        null
      );

      expect(result.success).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: []
        })
      );
    });

    it('should return error when recipient email is not provided', async () => {
      const result = await notificationService.sendCertificateDelivery(
        mockCertificateData,
        null,
        mockQRData
      );

      expect(result.success).toBe(false);
      expect(result.error).toEqual({
        code: 'EMAIL_DELIVERY_FAILED',
        message: 'Failed to send certificate delivery email',
        details: 'Recipient email is required'
      });
    });

    it('should return error when transporter is not initialized', async () => {
      notificationService.transporter = null;

      const result = await notificationService.sendCertificateDelivery(
        mockCertificateData,
        'recipient@example.com',
        mockQRData
      );

      expect(result.success).toBe(false);
      expect(result.error).toEqual({
        code: 'EMAIL_DELIVERY_FAILED',
        message: 'Failed to send certificate delivery email',
        details: 'Email transporter not initialized'
      });
    });

    it('should handle email sending failure', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Error'));

      const result = await notificationService.sendCertificateDelivery(
        mockCertificateData,
        'recipient@example.com',
        mockQRData
      );

      expect(result.success).toBe(false);
      expect(result.error).toEqual({
        code: 'EMAIL_DELIVERY_FAILED',
        message: 'Failed to send certificate delivery email',
        details: 'SMTP Error'
      });
    });
  });

  describe('sendIssuerNotification', () => {
    const mockCertificateData = {
      tokenId: '456',
      recipientName: 'Jane Smith',
      courseName: 'Smart Contracts',
      institutionName: 'Crypto Academy',
      issueDate: 1640995200,
      issuer: '0x9876543210987654321098765432109876543210'
    };

    beforeEach(async () => {
      // Ensure service is initialized
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should send issuer notification email successfully', async () => {
      const result = await notificationService.sendIssuerNotification(
        mockCertificateData,
        'issuer@example.com'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        messageId: 'test-message-id',
        issuerEmail: 'issuer@example.com',
        certificateId: '456',
        previewURL: 'https://ethereal.email/message/test'
      });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: '"VerifyCert Test" <test@verifycert.com>',
        to: 'issuer@example.com',
        subject: 'Certificate Issued Successfully - Smart Contracts',
        html: expect.stringContaining('Certificate Issued Successfully'),
        text: expect.stringContaining('Certificate Issued Successfully')
      });
    });

    it('should return error when issuer email is not provided', async () => {
      const result = await notificationService.sendIssuerNotification(
        mockCertificateData,
        null
      );

      expect(result.success).toBe(false);
      expect(result.error).toEqual({
        code: 'EMAIL_NOTIFICATION_FAILED',
        message: 'Failed to send issuer notification email',
        details: 'Issuer email is required'
      });
    });

    it('should handle email sending failure', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('Network timeout'));

      const result = await notificationService.sendIssuerNotification(
        mockCertificateData,
        'issuer@example.com'
      );

      expect(result.success).toBe(false);
      expect(result.error).toEqual({
        code: 'EMAIL_NOTIFICATION_FAILED',
        message: 'Failed to send issuer notification email',
        details: 'Network timeout'
      });
    });
  });

  describe('generateCertificateEmailTemplate', () => {
    const mockCertificateData = {
      tokenId: '789',
      recipientName: 'Alice Johnson',
      courseName: 'Web3 Development',
      institutionName: 'Blockchain Institute',
      issueDate: 1640995200
    };

    const mockQRData = {
      qrImageURL: '/qr/certificate-789.png'
    };

    it('should generate HTML and text templates with QR code', () => {
      const template = notificationService.generateCertificateEmailTemplate(
        mockCertificateData,
        mockQRData
      );

      expect(template.html).toContain('Alice Johnson');
      expect(template.html).toContain('Web3 Development');
      expect(template.html).toContain('Blockchain Institute');
      expect(template.html).toContain('789');
      expect(template.html).toContain('cid:qrcode');
      expect(template.html).toContain('http://localhost:3000/verify/789');
      expect(template.html).toContain('http://localhost:3000/certificate/789');

      expect(template.text).toContain('Alice Johnson');
      expect(template.text).toContain('Web3 Development');
      expect(template.text).toContain('Blockchain Institute');
      expect(template.text).toContain('789');
      expect(template.text).toContain('http://localhost:3000/verify/789');
      expect(template.text).toContain('http://localhost:3000/certificate/789');
    });

    it('should generate templates without QR code when not provided', () => {
      const template = notificationService.generateCertificateEmailTemplate(
        mockCertificateData,
        null
      );

      expect(template.html).toContain('QR code will be available shortly');
      expect(template.html).not.toContain('cid:qrcode');
    });

    it('should format date correctly', () => {
      const template = notificationService.generateCertificateEmailTemplate(
        mockCertificateData,
        mockQRData
      );

      const expectedDate = new Date(1640995200 * 1000).toLocaleDateString();
      expect(template.html).toContain(expectedDate);
      expect(template.text).toContain(expectedDate);
    });
  });

  describe('generateIssuerNotificationTemplate', () => {
    const mockCertificateData = {
      tokenId: '101',
      recipientName: 'Bob Wilson',
      courseName: 'DeFi Protocols',
      institutionName: 'Finance Academy',
      issueDate: 1640995200
    };

    it('should generate HTML and text templates for issuer', () => {
      const template = notificationService.generateIssuerNotificationTemplate(
        mockCertificateData
      );

      expect(template.html).toContain('Certificate Issued Successfully');
      expect(template.html).toContain('Bob Wilson');
      expect(template.html).toContain('DeFi Protocols');
      expect(template.html).toContain('Finance Academy');
      expect(template.html).toContain('101');
      expect(template.html).toContain('http://localhost:3000/verify/101');
      expect(template.html).toContain('http://localhost:3000/certificate/101');
      expect(template.html).toContain('http://localhost:3000/dashboard');

      expect(template.text).toContain('Certificate Issued Successfully');
      expect(template.text).toContain('Bob Wilson');
      expect(template.text).toContain('DeFi Protocols');
      expect(template.text).toContain('Finance Academy');
      expect(template.text).toContain('101');
    });

    it('should include all required links in templates', () => {
      const template = notificationService.generateIssuerNotificationTemplate(
        mockCertificateData
      );

      // Check HTML links
      expect(template.html).toContain('href="http://localhost:3000/certificate/101"');
      expect(template.html).toContain('href="http://localhost:3000/verify/101"');
      expect(template.html).toContain('href="http://localhost:3000/dashboard"');

      // Check text links
      expect(template.text).toContain('View Certificate: http://localhost:3000/certificate/101');
      expect(template.text).toContain('Verification Link: http://localhost:3000/verify/101');
      expect(template.text).toContain('Dashboard: http://localhost:3000/dashboard');
    });
  });

  describe('environment configuration', () => {
    it('should use custom frontend URL when provided', () => {
      process.env.FRONTEND_URL = 'https://verifycert.com';
      
      const template = notificationService.generateCertificateEmailTemplate({
        tokenId: '999',
        recipientName: 'Test User',
        courseName: 'Test Course',
        institutionName: 'Test Institution',
        issueDate: 1640995200
      }, null);

      expect(template.html).toContain('https://verifycert.com/verify/999');
      expect(template.html).toContain('https://verifycert.com/certificate/999');
    });

    it('should use default sender information when not provided', async () => {
      delete process.env.FROM_NAME;
      delete process.env.FROM_EMAIL;

      await notificationService.sendCertificateDelivery({
        tokenId: '123',
        recipientName: 'Test User',
        courseName: 'Test Course',
        institutionName: 'Test Institution',
        issueDate: 1640995200
      }, 'test@example.com', null);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '"VerifyCert" <noreply@verifycert.com>'
        })
      );
    });
  });
});