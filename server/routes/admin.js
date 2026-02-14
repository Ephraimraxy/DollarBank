import express from 'express';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler, NotFoundError, ValidationError } from '../utils/errors.js';
import { validate } from '../middleware/validation.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

// Get all users
router.get('/users', asyncHandler(async (req, res) => {
    const result = await query(`
        SELECT 
            id, 
            full_name, 
            email, 
            is_admin, 
            is_verified, 
            created_at, 
            updated_at
        FROM users 
        ORDER BY created_at DESC
    `);
    
    res.json(result.rows);
}));

// Get single user by ID
router.get('/users/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const result = await query(`
        SELECT 
            id, 
            full_name, 
            email, 
            is_admin, 
            is_verified, 
            created_at, 
            updated_at
        FROM users 
        WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
        throw new NotFoundError('User not found');
    }
    
    res.json(result.rows[0]);
}));

// Update user
router.put('/users/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { fullName, email, isAdmin, isVerified } = req.body;
    
    // Validate input
    if (!fullName || fullName.trim().length < 2) {
        throw new ValidationError('Full name must be at least 2 characters');
    }
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new ValidationError('Valid email is required');
    }
    
    // Check if user exists
    const userCheck = await query('SELECT id FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
        throw new NotFoundError('User not found');
    }
    
    // Check if email is already taken by another user
    const emailCheck = await query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
    if (emailCheck.rows.length > 0) {
        throw new ValidationError('Email is already taken by another user');
    }
    
    // Update user
    const result = await query(`
        UPDATE users 
        SET 
            full_name = $1, 
            email = $2, 
            is_admin = $3, 
            is_verified = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING id, full_name, email, is_admin, is_verified, created_at, updated_at
    `, [fullName, email, Boolean(isAdmin), Boolean(isVerified), id]);
    
    res.json(result.rows[0]);
}));

// Update user password
router.put('/users/:id/password', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
        throw new ValidationError('Password must be at least 6 characters');
    }
    
    // Check if user exists
    const userCheck = await query('SELECT id FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
        throw new NotFoundError('User not found');
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await query(`
        UPDATE users 
        SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
    `, [hashedPassword, id]);
    
    res.json({ message: 'Password updated successfully' });
}));

// Delete user
router.delete('/users/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
        throw new ValidationError('You cannot delete your own account');
    }
    
    // Check if user exists
    const userCheck = await query('SELECT id FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
        throw new NotFoundError('User not found');
    }
    
    // Delete related data first (in case CASCADE isn't working)
    // Delete transactions
    await query('DELETE FROM transactions WHERE user_id = $1', [id]);
    // Delete accounts
    await query('DELETE FROM accounts WHERE user_id = $1', [id]);
    // Delete user
    await query('DELETE FROM users WHERE id = $1', [id]);
    
    res.json({ message: 'User deleted successfully' });
}));

// Get user statistics
router.get('/stats', asyncHandler(async (req, res) => {
    const [totalUsers, verifiedUsers, adminUsers, totalAccounts, totalTransactions] = await Promise.all([
        query('SELECT COUNT(*) as count FROM users'),
        query('SELECT COUNT(*) as count FROM users WHERE is_verified = TRUE'),
        query('SELECT COUNT(*) as count FROM users WHERE is_admin = TRUE'),
        query('SELECT COUNT(*) as count FROM accounts'),
        query('SELECT COUNT(*) as count FROM transactions'),
    ]);
    
    res.json({
        totalUsers: parseInt(totalUsers.rows[0].count),
        verifiedUsers: parseInt(verifiedUsers.rows[0].count),
        adminUsers: parseInt(adminUsers.rows[0].count),
        totalAccounts: parseInt(totalAccounts.rows[0].count),
        totalTransactions: parseInt(totalTransactions.rows[0].count),
    });
}));

export default router;

