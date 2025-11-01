const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

const mail = {
    async sendOTP(toEmail, otpCode, userName) {
        try {
            const mailOptions = {
                from: `"Hatchr" <${process.env.EMAIL_USER}>`,
                to: toEmail,
                subject: 'Verify Your Email - Hatchr',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Welcome to Hatchr${userName ? ', ' + userName : ''}!</h2>
            <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <h1 style="color: #1f2937; font-size: 36px; margin: 0; letter-spacing: 8px;">${otpCode}</h1>
            </div>
            <p style="color: #6b7280;">This OTP will expire in <strong>10 minutes</strong>.</p>
            <p style="color: #6b7280;">If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px;">© 2025 Hatchr. All rights reserved.</p>
          </div>
        `
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('OTP email sent:', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending OTP email:', error);
            throw error;
        }
    },

    async sendWelcome(toEmail, userName) {
        try {
            const mailOptions = {
                from: `"Hatchr" <${process.env.EMAIL_USER}>`,
                to: toEmail,
                subject: 'Welcome to Hatchr! 🎉',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Welcome to Hatchr, ${userName}! 🚀</h2>
            <p>Your email has been successfully verified!</p>
            <p>You're all set to start hatching amazing projects and collaborating with others.</p>
            <div style="margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                 style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Get Started
              </a>
            </div>
            <p style="color: #6b7280;">Happy hatching!</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px;">© 2025 Hatchr. All rights reserved.</p>
          </div>
        `
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('Welcome email sent:', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending welcome email:', error);
            throw error;
        }
    }
};

module.exports = mail;
