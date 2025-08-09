const nodemailer = require('nodemailer');
const twilio = require('twilio');
const OTP = require('../models/OTP');
const AuthUtils = require('../utils/auth');

// Regional SMS gateway configuration
const REGIONAL_SMS_GATEWAYS = {
  // Africa's Talking regions
  AFRICAS_TALKING: ['KE', 'UG', 'TZ', 'RW', 'ZM', 'MW', 'NG', 'GH'],
  
  // Twilio (default for most regions)
  TWILIO: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IN', 'BR', 'MX', 'SG', 'MY']
};

class OTPService {
  constructor() {
    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Initialize Twilio client
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }

    // Initialize Africa's Talking client (if configured)
    if (process.env.AFRICAS_TALKING_USERNAME && process.env.AFRICAS_TALKING_API_KEY) {
      // Africa's Talking would be initialized here
      // this.africasTalkingClient = new AfricasTalking({...});
    }
  }

  // Send OTP via email
  async sendEmailOTP(user, otpCode, type = 'email') {
    // Check if email service is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`⚠️ Email service not configured - OTP would be sent to ${AuthUtils.hashForLogging(user.email)}: ${otpCode}`);
      return { success: true, messageId: 'test-mode', testMode: true };
    }

    if (!this.emailTransporter) {
      throw new Error('Email service not configured');
    }

    const subject = this.getEmailSubject(type);
    const html = this.getEmailTemplate(user.name, otpCode, type);

    const mailOptions = {
      from: `"VerifyCert" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject,
      html
    };

    try {
      const info = await this.emailTransporter.sendMail(mailOptions);
      console.log(`Email OTP sent to ${AuthUtils.hashForLogging(user.email)}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email OTP send failed:', error);
      throw new Error('Failed to send email OTP');
    }
  }

  // Send OTP via SMS
  async sendSMSOTP(user, otpCode, type = 'sms') {
    // Check if SMS service is configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log(`⚠️ SMS service not configured - OTP would be sent to ${AuthUtils.hashForLogging(user.phone)}: ${otpCode}`);
      return { success: true, sid: 'test-mode', testMode: true };
    }

    if (!this.twilioClient) {
      throw new Error('SMS service not configured');
    }

    const message = this.getSMSMessage(otpCode, type);

    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: user.phone
      });

      console.log(`SMS OTP sent to ${AuthUtils.hashForLogging(user.phone)}: ${result.sid}`);
      return { success: true, sid: result.sid };
    } catch (error) {
      console.error('SMS OTP send failed:', error);
      throw new Error('Failed to send SMS OTP');
    }
  }

  // Generate and send OTP
  async generateAndSendOTP(user, type = 'email', expirationMinutes = 5) {
    // Check rate limiting
    const recentAttempts = await OTP.getRecentAttempts(user.id, type, 5);
    if (recentAttempts >= 3) {
      throw new Error('Too many OTP requests. Please wait 5 minutes before requesting again.');
    }

    // Create OTP
    const otp = await OTP.create(user.id, type, expirationMinutes);

    // Send OTP based on type
    let sendResult;
    if (type === 'email' || (type === 'password_reset' && user.email)) {
      sendResult = await this.sendEmailOTP(user, otp.code, type);
    } else if (type === 'sms' || (type === 'password_reset' && user.phone)) {
      sendResult = await this.sendSMSOTP(user, otp.code, type);
    } else {
      throw new Error('Invalid OTP type or user contact method not available');
    }

    return {
      success: true,
      otpId: otp.id,
      expiresAt: otp.expires_at,
      sendResult
    };
  }

  // Verify OTP
  async verifyOTP(userId, code, type) {
    return await OTP.verifyAndConsume(userId, code, type);
  }

  // Get email subject based on type
  getEmailSubject(type) {
    switch (type) {
      case 'email':
        return 'Verify Your VerifyCert Account';
      case 'password_reset':
        return 'Reset Your VerifyCert Password';
      default:
        return 'VerifyCert Verification Code';
    }
  }

  // Get email template
  getEmailTemplate(userName, otpCode, type) {
    const baseTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>VerifyCert - Verification Code</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .otp-code { font-size: 32px; font-weight: bold; color: #2563eb; text-align: center; 
                     padding: 20px; background: white; border-radius: 8px; margin: 20px 0; 
                     letter-spacing: 4px; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .warning { color: #dc2626; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VerifyCert</h1>
            <p>Blockchain Certificate Verification</p>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            ${this.getEmailContent(type)}
            <div class="otp-code">${otpCode}</div>
            <p><strong>This code will expire in 5 minutes.</strong></p>
            <p class="warning">⚠️ Never share this code with anyone. VerifyCert will never ask for your verification code.</p>
          </div>
          <div class="footer">
            <p>If you didn't request this code, please ignore this email.</p>
            <p>&copy; 2024 VerifyCert. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return baseTemplate;
  }

  // Get email content based on type
  getEmailContent(type) {
    switch (type) {
      case 'email':
        return `
          <p>Thank you for registering with VerifyCert! To complete your account verification, please use the following code:</p>
        `;
      case 'password_reset':
        return `
          <p>You requested to reset your VerifyCert password. Use the following code to proceed with password reset:</p>
        `;
      default:
        return `
          <p>Here is your VerifyCert verification code:</p>
        `;
    }
  }

  // Get SMS message
  getSMSMessage(otpCode, type) {
    switch (type) {
      case 'sms':
        return `VerifyCert: Your verification code is ${otpCode}. This code expires in 5 minutes. Never share this code with anyone.`;
      case 'password_reset':
        return `VerifyCert: Your password reset code is ${otpCode}. This code expires in 5 minutes. If you didn't request this, ignore this message.`;
      default:
        return `VerifyCert: Your verification code is ${otpCode}. Expires in 5 minutes.`;
    }
  }

  // Test email configuration
  async testEmailConfig() {
    try {
      await this.emailTransporter.verify();
      return { success: true, message: 'Email configuration is valid' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Test SMS configuration
  async testSMSConfig() {
    if (!this.twilioClient) {
      return { success: false, error: 'Twilio not configured' };
    }

    try {
      const account = await this.twilioClient.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
      return { success: true, message: 'SMS configuration is valid', account: account.friendlyName };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const otpService = new OTPService();

module.exports = otpService;