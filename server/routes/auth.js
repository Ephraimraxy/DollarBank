import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';

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
        const result = await query(
            'INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, full_name, email',
            [fullName, email, hashedPassword]
        );

        // Create default accounts for the new user
        const userId = result.rows[0].id;
        await query("INSERT INTO accounts (user_id, type, balance, account_number) VALUES ($1, 'Checking', 0.00, $2)", [userId, 'CK-' + Date.now()]);
        await query("INSERT INTO accounts (user_id, type, balance, account_number) VALUES ($1, 'Savings', 0.00, $2)", [userId, 'SV-' + Date.now()]);

        const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ user: result.rows[0], token });
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

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });

        // Return user info without password
        const { password_hash, ...userInfo } = user;
        res.json({ user: userInfo, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
