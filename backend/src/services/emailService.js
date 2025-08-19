const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configure transporter based on environment
    if (process.env.NODE_ENV === 'production') {
      // Production: Use your email service (Gmail, SendGrid, etc.)
      this.transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    } else {
      // Development: Use Ethereal Email (fake SMTP service for testing)
      this.transporter = null;
      this.initTestAccount();
    }
  }

  async initTestAccount() {
    try {
      // Create test account for development
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      console.log('📧 Email service initialized with test account:', testAccount.user);
    } catch (error) {
      console.error('❌ Failed to initialize test email account:', error.message);
    }
  }

  async sendVerificationEmail(email, name, verificationToken) {
    if (!this.transporter) {
      console.log('⚠️ Email service not initialized, skipping email send');
      return { success: false, message: 'Email service not available' };
    }

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Blog360" <noreply@blog360.com>',
      to: email,
      subject: 'Verify your email address - Blog360',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3B82F6; margin: 0;">Blog360</h1>
            <p style="color: #666; margin: 5px 0;">Welcome to our community!</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${name}!</h2>
            <p style="color: #666; line-height: 1.6;">
              Thank you for signing up for Blog360. To complete your registration and start exploring our premium content, 
              please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; 
                        border-radius: 6px; font-weight: bold; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 0;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="color: #3B82F6; word-break: break-all; margin-top: 10px;">
              ${verificationUrl}
            </p>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 14px;">
            <p>This verification link will expire in 24 hours.</p>
            <p>If you didn't create an account with Blog360, you can safely ignore this email.</p>
          </div>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('📧 Verification email sent!');
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      
      return { 
        success: true, 
        messageId: info.messageId,
        previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(info) : null
      };
    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      return { success: false, message: error.message };
    }
  }

  async sendPasswordResetEmail(email, name, resetToken) {
    if (!this.transporter) {
      return { success: false, message: 'Email service not available' };
    }

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Blog360" <noreply@blog360.com>',
      to: email,
      subject: 'Reset your password - Blog360',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3B82F6; margin: 0;">Blog360</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
            <p style="color: #666; line-height: 1.6;">
              Hi ${name}, we received a request to reset your password. Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #EF4444; color: white; padding: 12px 30px; text-decoration: none; 
                        border-radius: 6px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
            </p>
          </div>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      return { success: false, message: error.message };
    }
  }
}

module.exports = new EmailService();
