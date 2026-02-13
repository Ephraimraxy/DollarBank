import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Resend only if API key is present
const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

const EMAIL_FROM = 'Vault ID <onboarding@resend.dev>'; // Update this with your verified domain later

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
    const link = `${process.env.FRONTEND_URL}/verify?token=${token}`;
    const html = `
    <h1>Verify your Vault ID Identity</h1>
    <p>Please click the link below to verify your email address:</p>
    <a href="${link}">${link}</a>
  `;
    return sendEmail(email, 'Verify your email', html);
};

export const sendPasswordResetEmail = async (email, token) => {
    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const html = `
    <h1>Reset your Vault Passphrase</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${link}">${link}</a>
  `;
    return sendEmail(email, 'Reset Password', html);
};

export const sendTransferNotification = async (toEmail, amount, senderName) => {
    const html = `
    <h1>Funds Received</h1>
    <p>You have received <strong>$${amount}</strong> from ${senderName}.</p>
    <p>Login to your Vault ID to view the transaction.</p>
  `;
    return sendEmail(toEmail, 'Funds Received - Vault ID', html);
};
