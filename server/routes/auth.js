import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../db.js';
import { config } from '../config/index.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendOTPEmail } from '../services/email.js';
import { asyncHandler, ConflictError, AuthenticationError, NotFoundError, ValidationError } from '../utils/errors.js';
import {
    registerValidation,
    loginValidation,
    passwordResetValidation,
    resetPasswordValidation,
    verifyEmailValidation,
    validate,
} from '../middleware/validation.js';
import { authLimiter, passwordResetLimiter } from '../middleware/security.js';

const router = express.Router();

router.post('/register', authLimiter, validate(registerValidation), asyncHandler(async (req, res) => {
    const { fullName, email, password } = req.body;

    const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
        throw new ConflictError('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const result = await query(
        'INSERT INTO users (full_name, email, password_hash, otp_code, otp_expiry) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email',
        [fullName, email, hashedPassword, otpCode, otpExpiry]
    );

    // Create default accounts
    const userId = result.rows[0].id;
    await query("INSERT INTO accounts (user_id, type, balance, account_number) VALUES ($1, 'Checking', 0.00, $2)", [userId, 'CK-' + Date.now()]);
    await query("INSERT INTO accounts (user_id, type, balance, account_number) VALUES ($1, 'Savings', 0.00, $2)", [userId, 'SV-' + Date.now()]);

    // Send OTP Email (fire and forget)
    sendOTPEmail(email, otpCode).catch(err => {
        console.error('Failed to send OTP email:', err);
    });

    res.status(201).json({ 
        user: result.rows[0], 
        message: 'OTP sent to your email',
        email: email // Return email for frontend to use in OTP verification
    });
}));

router.post('/login', authLimiter, validate(loginValidation), asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
        throw new AuthenticationError('Invalid email or password');
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
        throw new AuthenticationError('Invalid email or password');
    }

    // Enforce email verification for non-admin users
    if (!user.is_verified && !user.is_admin) {
        throw new AuthenticationError('Please verify your email from the link we sent.');
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, isAdmin: user.is_admin },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
    );

    const { password_hash, verification_token, reset_token, ...userInfo } = user;
    res.json({ user: userInfo, token });
}));

router.post('/verify-otp', authLimiter, asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp || otp.length !== 6) {
        throw new ValidationError('Email and 6-digit OTP are required');
    }

    const result = await query(
        'SELECT * FROM users WHERE email = $1 AND otp_code = $2 AND otp_expiry > NOW()',
        [email, otp]
    );
    
    if (result.rows.length === 0) {
        throw new ValidationError('Invalid or expired OTP code');
    }

    const user = result.rows[0];
    
    // Mark user as verified and clear OTP
    await query(
        'UPDATE users SET is_verified = TRUE, otp_code = NULL, otp_expiry = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
    );

    // Generate JWT token for immediate login
    const token = jwt.sign(
        { id: user.id, email: user.email, isAdmin: user.is_admin },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
    );

    const { password_hash, otp_code, otp_expiry, verification_token, reset_token, ...userInfo } = user;
    res.json({ 
        message: 'Email verified successfully',
        user: { ...userInfo, is_verified: true },
        token
    });
}));

router.post('/resend-otp', authLimiter, validate(passwordResetValidation), asyncHandler(async (req, res) => {
    const { email } = req.body;

    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
        throw new NotFoundError('User not found');
    }

    const user = result.rows[0];
    if (user.is_verified) {
        throw new ConflictError('Email already verified');
    }

    // Generate new 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await query('UPDATE users SET otp_code = $1, otp_expiry = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3', [otpCode, otpExpiry, user.id]);

    sendOTPEmail(email, otpCode).catch(err => {
        console.error('Failed to send OTP email:', err);
    });

    res.json({ message: 'OTP resent to your email' });
}));

router.post('/verify-email', validate(verifyEmailValidation), asyncHandler(async (req, res) => {
    const { token } = req.body;

    const result = await query(
        'UPDATE users SET is_verified = TRUE, verification_token = NULL, updated_at = CURRENT_TIMESTAMP WHERE verification_token = $1 RETURNING *',
        [token]
    );
    
    if (result.rows.length === 0) {
        throw new ValidationError('Invalid or expired verification token');
    }
    
    res.json({ message: 'Email verified successfully' });
}));

router.post('/resend-verification', authLimiter, validate(passwordResetValidation), asyncHandler(async (req, res) => {
    const { email } = req.body;

    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
        throw new NotFoundError('User not found');
    }

    const user = result.rows[0];
    if (user.is_verified) {
        throw new ConflictError('Email already verified');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await query('UPDATE users SET verification_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [verificationToken, user.id]);

    sendVerificationEmail(email, verificationToken).catch(err => {
        console.error('Failed to send verification email:', err);
    });

    res.json({ message: 'Verification email resent' });
}));

router.post('/forgot-password', passwordResetLimiter, validate(passwordResetValidation), asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await query('SELECT * FROM users WHERE email = $1', [email]);
    // Don't reveal if user exists (security best practice)
    if (user.rows.length === 0) {
        // Still return success to prevent email enumeration
        return res.json({ message: 'If an account exists with this email, a password reset link has been sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await query('UPDATE users SET reset_token = $1, reset_token_expiry = $2, updated_at = CURRENT_TIMESTAMP WHERE email = $3', [resetToken, expiry, email]);
    
    sendPasswordResetEmail(email, resetToken).catch(err => {
        console.error('Failed to send password reset email:', err);
    });

    res.json({ message: 'If an account exists with this email, a password reset link has been sent' });
}));

router.post('/reset-password', passwordResetLimiter, validate(resetPasswordValidation), asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    const user = await query('SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()', [token]);
    if (user.rows.length === 0) {
        throw new ValidationError('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await query(
        'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [hashedPassword, user.rows[0].id]
    );

    res.json({ message: 'Password updated successfully' });
}));

export default router;
