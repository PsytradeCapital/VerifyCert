const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter based on environment configuration
   */
  async initializeTransporter() {
    try {
      // Configuration for different email providers
      const emailConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true' || false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      };

      // For development/testing, use ethereal email
      if (process.env.NODE_ENV === 'test' || !process.env.SMTP_USER) {
        const testAccount = await nodemailer.createTestAccount();
        emailConfig.host = 'smtp.ethereal.email';
        emailConfig.port = 587;
        emailConfig.secure = false;
        emailConfig.auth = {
          user: testAccount.user,
          pass: testAccount.pass
        };
      }

      this.transporter = nodemailer.createTransport(emailConfig);

      // Verify connection configuration
      await this.transporter.verify();
      console.log('Email transporter initialized successfully');

    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
      // Don't throw error to allow service to continue without email
    }
  }

  /**
   * Send certificate delivery email to recipient
   * @param {Object} certificateData - Certificate information
   * @param {string} recipientEmail - Recipient's email address
   * @param {Object} qrData - QR code data from QRCodeService
   * @returns {Promise<Object>} Email sending result
   */
  async sendCertificateDelivery(certificateData, recipientEmail, qrData) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      if (!recipientEmail) {
        throw new Error('Recipient email is required');
      }

      const emailTemplate = this.generateCertificateEmailTemplate(certificateData, qrData);

      const mailOptions = {
        from: `"${process.env.FROM_NAME || 'VerifyCert'}" <${process.env.FROM_EMAIL || 'noreply@verifycert.com'}>`,
        to: recipientEmail,
        subject: `Your Certificate: ${certificateData.courseName}`,
        html: emailTemplate.html,
        text: emailTemplate.text,
        attachments: []
      };

      // Add QR code as attachment if available
      if (qrData && qrData.qrImageURL) {
        mailOptions.attachments.push({
          filename: `certificate-qr-${certificateData.tokenId}.png`,
          path: qrData.qrImageURL,
          cid: 'qrcode' // Content ID for embedding in HTML
        });
      }

      const info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        data: {
          messageId: info.messageId,
          recipientEmail,
          certificateId: certificateData.tokenId,
          previewURL: nodemailer.getTestMessageUrl(info) // For ethereal email testing
        }
      };

    } catch (error) {
      console.error('Certificate delivery email failed:', error);
      return {
        success: false,
        error: {
          code: 'EMAIL_DELIVERY_FAILED',
          message: 'Failed to send certificate delivery email',
          details: error.message
        }
      };
    }
  }

  /**
   * Send certificate issuance notification to issuer
   * @param {Object} certificateData - Certificate information
   * @param {string} issuerEmail - Issuer's email address
   * @returns {Promise<Object>} Email sending result
   */
  async sendIssuerNotification(certificateData, issuerEmail) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      if (!issuerEmail) {
        throw new Error('Issuer email is required');
      }

      const emailTemplate = this.generateIssuerNotificationTemplate(certificateData);

      const mailOptions = {
        from: `"${process.env.FROM_NAME || 'VerifyCert'}" <${process.env.FROM_EMAIL || 'noreply@verifycert.com'}>`,
        to: issuerEmail,
        subject: `Certificate Issued Successfully - ${certificateData.courseName}`,
        html: emailTemplate.html,
        text: emailTemplate.text
      };

      const info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        data: {
          messageId: info.messageId,
          issuerEmail,
          certificateId: certificateData.tokenId,
          previewURL: nodemailer.getTestMessageUrl(info)
        }
      };

    } catch (error) {
      console.error('Issuer notification email failed:', error);
      return {
        success: false,
        error: {
          code: 'EMAIL_NOTIFICATION_FAILED',
          message: 'Failed to send issuer notification email',
          details: error.message
        }
      };
    }
  }

  /**
   * Generate HTML and text email template for certificate delivery
   * @param {Object} certificateData - Certificate information
   * @param {Object} qrData - QR code data
   * @returns {Object} Email template with html and text versions
   */
  generateCertificateEmailTemplate(certificateData, qrData) {
    const verificationURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${certificateData.tokenId}`;
    const certificateURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/certificate/${certificateData.tokenId}`;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Digital Certificate</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .certificate-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .qr-section { text-align: center; margin: 30px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎓 Congratulations!</h1>
          <p>You have received a verified digital certificate</p>
        </div>
        
        <div class="content">
          <div class="certificate-info">
            <h2>Certificate Details</h2>
            <p><strong>Recipient:</strong> ${certificateData.recipientName}</p>
            <p><strong>Course/Achievement:</strong> ${certificateData.courseName}</p>
            <p><strong>Institution:</strong> ${certificateData.institutionName}</p>
            <p><strong>Issue Date:</strong> ${new Date(certificateData.issueDate * 1000).toLocaleDateString()}</p>
            <p><strong>Certificate ID:</strong> ${certificateData.tokenId}</p>
          </div>

          <div class="qr-section">
            <h3>Quick Verification</h3>
            <p>Scan this QR code for instant verification:</p>
            ${qrData && qrData.qrImageURL ? '<img src="cid:qrcode" alt="QR Code" style="max-width: 200px; border: 1px solid #ddd; padding: 10px;">' : '<p>QR code will be available shortly</p>'}
          </div>

          <div style="text-align: center;">
            <a href="${certificateURL}" class="button">View Certificate</a>
            <a href="${verificationURL}" class="button">Verify Certificate</a>
          </div>

          <div style="margin-top: 30px; padding: 20px; background: #e8f4fd; border-radius: 8px;">
            <h4>🔒 About Your Digital Certificate</h4>
            <p>This certificate is stored on the blockchain as a non-transferable NFT, ensuring it cannot be forged, duplicated, or tampered with. Anyone can verify its authenticity using the verification link above.</p>
          </div>
        </div>

        <div class="footer">
          <p>This certificate was issued through VerifyCert - Blockchain Certificate Verification System</p>
          <p>If you have any questions, please contact the issuing institution directly.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Congratulations! You have received a verified digital certificate.

Certificate Details:
- Recipient: ${certificateData.recipientName}
- Course/Achievement: ${certificateData.courseName}
- Institution: ${certificateData.institutionName}
- Issue Date: ${new Date(certificateData.issueDate * 1000).toLocaleDateString()}
- Certificate ID: ${certificateData.tokenId}

View your certificate: ${certificateURL}
Verify certificate: ${verificationURL}

About Your Digital Certificate:
This certificate is stored on the blockchain as a non-transferable NFT, ensuring it cannot be forged, duplicated, or tampered with. Anyone can verify its authenticity using the verification link above.

This certificate was issued through VerifyCert - Blockchain Certificate Verification System.
If you have any questions, please contact the issuing institution directly.
    `;

    return { html, text };
  }

  /**
   * Generate HTML and text email template for issuer notification
   * @param {Object} certificateData - Certificate information
   * @returns {Object} Email template with html and text versions
   */
  generateIssuerNotificationTemplate(certificateData) {
    const verificationURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${certificateData.tokenId}`;
    const certificateURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/certificate/${certificateData.tokenId}`;
    const dashboardURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate Issued Successfully</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .certificate-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .success-icon { font-size: 48px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="success-icon">✅</div>
          <h1>Certificate Issued Successfully!</h1>
          <p>Your digital certificate has been minted on the blockchain</p>
        </div>
        
        <div class="content">
          <div class="certificate-info">
            <h2>Certificate Details</h2>
            <p><strong>Recipient:</strong> ${certificateData.recipientName}</p>
            <p><strong>Course/Achievement:</strong> ${certificateData.courseName}</p>
            <p><strong>Institution:</strong> ${certificateData.institutionName}</p>
            <p><strong>Issue Date:</strong> ${new Date(certificateData.issueDate * 1000).toLocaleDateString()}</p>
            <p><strong>Certificate ID:</strong> ${certificateData.tokenId}</p>
            <p><strong>Blockchain Status:</strong> <span style="color: #10b981; font-weight: bold;">Confirmed</span></p>
          </div>

          <div style="background: #e6fffa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📧 Next Steps</h3>
            <p>The certificate has been successfully minted on the blockchain. You can now:</p>
            <ul>
              <li>Share the verification link with the recipient</li>
              <li>Send the certificate via email (if recipient email was provided)</li>
              <li>View the certificate in your issuer dashboard</li>
            </ul>
          </div>

          <div style="text-align: center;">
            <a href="${certificateURL}" class="button">View Certificate</a>
            <a href="${verificationURL}" class="button">Verification Link</a>
            <a href="${dashboardURL}" class="button">Dashboard</a>
          </div>

          <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <h4>🔗 Share These Links</h4>
            <p><strong>Certificate View:</strong><br>
            <a href="${certificateURL}" style="color: #1d4ed8; word-break: break-all;">${certificateURL}</a></p>
            <p><strong>Public Verification:</strong><br>
            <a href="${verificationURL}" style="color: #1d4ed8; word-break: break-all;">${verificationURL}</a></p>
          </div>
        </div>

        <div class="footer">
          <p>This notification was sent from VerifyCert - Blockchain Certificate Verification System</p>
          <p>Certificate ID: ${certificateData.tokenId}</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Certificate Issued Successfully!

Your digital certificate has been minted on the blockchain.

Certificate Details:
- Recipient: ${certificateData.recipientName}
- Course/Achievement: ${certificateData.courseName}
- Institution: ${certificateData.institutionName}
- Issue Date: ${new Date(certificateData.issueDate * 1000).toLocaleDateString()}
- Certificate ID: ${certificateData.tokenId}
- Blockchain Status: Confirmed

Next Steps:
The certificate has been successfully minted on the blockchain. You can now:
- Share the verification link with the recipient
- Send the certificate via email (if recipient email was provided)
- View the certificate in your issuer dashboard

Links:
- View Certificate: ${certificateURL}
- Verification Link: ${verificationURL}
- Dashboard: ${dashboardURL}

This notification was sent from VerifyCert - Blockchain Certificate Verification System
Certificate ID: ${certificateData.tokenId}
    `;

    return { html, text };
  }
}

module.exports = NotificationService;module.exp
orts = NotificationService;