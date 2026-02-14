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

// Get comprehensive dashboard statistics
router.get('/stats', asyncHandler(async (req, res) => {
    const [
        totalUsers, verifiedUsers, adminUsers, totalAccounts, totalTransactions,
        totalBalance, totalDeposits, totalWithdrawals, pendingTransactions, todayTransactions
    ] = await Promise.all([
        query('SELECT COUNT(*) as count FROM users'),
        query('SELECT COUNT(*) as count FROM users WHERE is_verified = TRUE'),
        query('SELECT COUNT(*) as count FROM users WHERE is_admin = TRUE'),
        query('SELECT COUNT(*) as count FROM accounts'),
        query('SELECT COUNT(*) as count FROM transactions'),
        query('SELECT COALESCE(SUM(balance), 0) as total FROM accounts'),
        query("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'credit'"),
        query("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'debit'"),
        query("SELECT COUNT(*) as count FROM transactions WHERE status = 'pending'"),
        query("SELECT COUNT(*) as count FROM transactions WHERE DATE(created_at) = CURRENT_DATE"),
    ]);
    
    res.json({
        users: {
            total: parseInt(totalUsers.rows[0].count),
            verified: parseInt(verifiedUsers.rows[0].count),
            admins: parseInt(adminUsers.rows[0].count),
        },
        accounts: {
            total: parseInt(totalAccounts.rows[0].count),
            totalBalance: parseFloat(totalBalance.rows[0].total || 0),
        },
        transactions: {
            total: parseInt(totalTransactions.rows[0].count),
            pending: parseInt(pendingTransactions.rows[0].count),
            today: parseInt(todayTransactions.rows[0].count),
            totalDeposits: parseFloat(totalDeposits.rows[0].total || 0),
            totalWithdrawals: parseFloat(totalWithdrawals.rows[0].total || 0),
        },
    });
}));

// Get all accounts with user info
router.get('/accounts', asyncHandler(async (req, res) => {
    const result = await query(`
        SELECT 
            a.id,
            a.account_number,
            a.type,
            a.balance,
            a.created_at,
            COALESCE(a.updated_at, a.created_at) as updated_at,
            u.id as user_id,
            u.full_name,
            u.email,
            u.is_verified
        FROM accounts a
        JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
    `);
    
    res.json(result.rows);
}));

// Get account by ID
router.get('/accounts/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const result = await query(`
        SELECT 
            a.*,
            u.full_name,
            u.email
        FROM accounts a
        JOIN users u ON a.user_id = u.id
        WHERE a.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
        throw new NotFoundError('Account not found');
    }
    
    res.json(result.rows[0]);
}));

// Update account balance (admin adjustment)
router.put('/accounts/:id/balance', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { balance, reason } = req.body;
    
    if (balance === undefined || balance < 0) {
        throw new ValidationError('Valid balance is required');
    }
    
    const accountCheck = await query('SELECT id, user_id FROM accounts WHERE id = $1', [id]);
    if (accountCheck.rows.length === 0) {
        throw new NotFoundError('Account not found');
    }
    
    const oldBalance = await query('SELECT balance FROM accounts WHERE id = $1', [id]);
    const oldBal = parseFloat(oldBalance.rows[0].balance);
    const adjustment = parseFloat(balance) - oldBal;
    
    // Update balance
    await query(
        'UPDATE accounts SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [balance, id]
    );
    
    // Record adjustment transaction
    await query(
        `INSERT INTO transactions (user_id, type, amount, description, status, category)
         VALUES ($1, $2, $3, $4, 'completed', 'admin_adjustment')`,
        [
            accountCheck.rows[0].user_id,
            adjustment >= 0 ? 'credit' : 'debit',
            Math.abs(adjustment),
            reason || `Admin balance adjustment: ${adjustment >= 0 ? '+' : ''}${adjustment.toFixed(2)}`
        ]
    );
    
    res.json({ message: 'Account balance updated successfully' });
}));

// Get all transactions with filters
router.get('/transactions', asyncHandler(async (req, res) => {
    const { status, type, limit = 100, offset = 0, userId } = req.query;
    
    let queryStr = `
        SELECT 
            t.*,
            u.full_name,
            u.email,
            a.account_number
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        LEFT JOIN accounts a ON a.user_id = u.id AND a.type = 'Checking'
    `;
    
    const conditions = [];
    const params = [];
    let paramCount = 1;
    
    if (status) {
        conditions.push(`t.status = $${paramCount++}`);
        params.push(status);
    }
    
    if (type) {
        conditions.push(`t.type = $${paramCount++}`);
        params.push(type);
    }
    
    if (userId) {
        conditions.push(`t.user_id = $${paramCount++}`);
        params.push(userId);
    }
    
    if (conditions.length > 0) {
        queryStr += ' WHERE ' + conditions.join(' AND ');
    }
    
    queryStr += ` ORDER BY t.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await query(queryStr, params);
    
    const countResult = await query(
        `SELECT COUNT(*) as count FROM transactions ${conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''}`,
        params.slice(0, -2)
    );
    
    res.json({
        transactions: result.rows,
        pagination: {
            total: parseInt(countResult.rows[0].count),
            limit: parseInt(limit),
            offset: parseInt(offset),
        },
    });
}));

// Update transaction status (approve/reject)
router.put('/transactions/:id/status', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'completed', 'failed'].includes(status)) {
        throw new ValidationError('Invalid status');
    }
    
    const result = await query(
        'UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
    );
    
    if (result.rows.length === 0) {
        throw new NotFoundError('Transaction not found');
    }
    
    res.json(result.rows[0]);
}));

// Refund transaction
router.post('/transactions/:id/refund', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    
    const transaction = await query('SELECT * FROM transactions WHERE id = $1', [id]);
    if (transaction.rows.length === 0) {
        throw new NotFoundError('Transaction not found');
    }
    
    const txn = transaction.rows[0];
    
    if (txn.status !== 'completed') {
        throw new ValidationError('Can only refund completed transactions');
    }
    
    await query('BEGIN');
    
    try {
        // Get user's checking account
        const account = await query(
            "SELECT * FROM accounts WHERE user_id = $1 AND type = 'Checking' LIMIT 1",
            [txn.user_id]
        );
        
        if (account.rows.length === 0) {
            await query('ROLLBACK');
            throw new NotFoundError('User account not found');
        }
        
        // Reverse the transaction
        if (txn.type === 'debit') {
            await query(
                'UPDATE accounts SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [txn.amount, account.rows[0].id]
            );
        } else {
            await query(
                'UPDATE accounts SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [txn.amount, account.rows[0].id]
            );
        }
        
        // Mark original transaction as failed
        await query('UPDATE transactions SET status = $1 WHERE id = $2', ['failed', id]);
        
        // Create refund transaction
        await query(
            `INSERT INTO transactions (user_id, type, amount, description, status, category)
             VALUES ($1, $2, $3, $4, 'completed', 'refund')`,
            [
                txn.user_id,
                txn.type === 'debit' ? 'credit' : 'debit',
                txn.amount,
                reason || `Refund for transaction #${id}`
            ]
        );
        
        await query('COMMIT');
        res.json({ message: 'Refund processed successfully' });
    } catch (err) {
        await query('ROLLBACK');
        throw err;
    }
}));

export default router;

