import { Resend } from 'resend';
import { config } from '../config/index.js';

// Initialize Resend only if API key is present
const resend = config.resendApiKey
    ? new Resend(config.resendApiKey)
    : null;

const EMAIL_FROM = config.resendFromEmail;

export const sendEmail = async (to, subject, html) => {
    if (!resend) {
        console.log(`[Email Service Mock] To: ${to}, Subject: ${subject}`);
        return { success: true, mock: true };
    }

    try {
        const data = await resend.emails.send({
            from: EMAIL_FROM,
            to,
            subject,
            html,
        });
        return { success: true, data };
    } catch (error) {
        console.error('Email Error:', error);
        return { success: false, error };
    }
};

export const sendVerificationEmail = async (email, token) => {
    const link = `${config.frontendUrl}/verify?token=${token}`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #dc2626; font-size: 24px; margin-bottom: 20px;">Verify your Vault ID Identity</h1>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Please click the link below to verify your email address and activate your account:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${link}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <a href="${link}" style="color: #dc2626; word-break: break-all;">${link}</a>
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
        This link will expire in 24 hours. If you didn't create a Vault ID account, please ignore this email.
      </p>
    </div>
  `;
    return sendEmail(email, 'Verify your Vault ID email', html);
};

export const sendPasswordResetEmail = async (email, token) => {
    const link = `${config.frontendUrl}/reset-password?token=${token}`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #dc2626; font-size: 24px; margin-bottom: 20px;">Reset your Vault Passphrase</h1>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        We received a request to reset your password. Click the link below to create a new passphrase:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${link}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <a href="${link}" style="color: #dc2626; word-break: break-all;">${link}</a>
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
        This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
      </p>
    </div>
  `;
    return sendEmail(email, 'Reset your Vault ID password', html);
};

export const sendTransferNotification = async (toEmail, amount, senderName) => {
    const html = `
    <h1>Funds Received</h1>
    <p>You have received <strong>$${amount}</strong> from ${senderName}.</p>
    <p>Login to your Vault ID to view the transaction.</p>
  `;
    return sendEmail(toEmail, 'Funds Received - Vault ID', html);
};
