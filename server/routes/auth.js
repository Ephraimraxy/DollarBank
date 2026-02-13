import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../db.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const result = await query(
            'INSERT INTO users (full_name, email, password_hash, verification_token) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email',
            [fullName, email, hashedPassword, verificationToken]
        );

        // Create default accounts
        const userId = result.rows[0].id;
        await query("INSERT INTO accounts (user_id, type, balance, account_number) VALUES ($1, 'Checking', 0.00, $2)", [userId, 'CK-' + Date.now()]);
        await query("INSERT INTO accounts (user_id, type, balance, account_number) VALUES ($1, 'Savings', 0.00, $2)", [userId, 'SV-' + Date.now()]);

        // Send Verification Email
        await sendVerificationEmail(email, verificationToken);

        const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ user: result.rows[0], token, message: 'Verification email sent' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Enforce email verification for non-admin users
        if (!user.is_verified && !user.is_admin) {
            return res.status(403).json({ error: 'Please verify your email from the link we sent.' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, isAdmin: user.is_admin }, process.env.JWT_SECRET, { expiresIn: '24h' });

        const { password_hash, verification_token, reset_token, ...userInfo } = user;
        res.json({ user: userInfo, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/verify-email', async (req, res) => {
    const { token } = req.body;
    try {
        const result = await query('UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = $1 RETURNING *', [token]);
        if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid or expired token' });
        res.json({ message: 'Email verified successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/resend-verification', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        if (user.is_verified) {
            return res.status(400).json({ error: 'Email already verified' });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        await query('UPDATE users SET verification_token = $1 WHERE id = $2', [verificationToken, user.id]);

        await sendVerificationEmail(email, verificationToken);

        res.json({ message: 'Verification email resent' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) return res.status(404).json({ error: 'User not found' });

        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 3600000); // 1 hour

        await query('UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3', [resetToken, expiry, email]);
        await sendPasswordResetEmail(email, resetToken);

        res.json({ message: 'Password reset email sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const user = await query('SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()', [token]);
        if (user.rows.length === 0) return res.status(400).json({ error: 'Invalid or expired token' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await query('UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2', [hashedPassword, user.rows[0].id]);

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
