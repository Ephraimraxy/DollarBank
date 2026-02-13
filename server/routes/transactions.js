import express from 'express';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendTransferNotification } from '../services/email.js';
import { asyncHandler, ValidationError, NotFoundError } from '../utils/errors.js';
import { validate, transferValidation } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit || '50', 10);
    const offset = parseInt(req.query.offset || '0', 10);
    
    const result = await query(
        'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
        [req.user.id, limit, offset]
    );
    
    const countResult = await query(
        'SELECT COUNT(*) FROM transactions WHERE user_id = $1',
        [req.user.id]
    );
    
    res.json({
        transactions: result.rows,
        pagination: {
            total: parseInt(countResult.rows[0].count, 10),
            limit,
            offset,
        },
    });
}));

router.post('/transfer', validate(transferValidation), asyncHandler(async (req, res) => {
    const { amount, recipientEmail } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    await query('BEGIN');

    try {
        // Get Sender Account (Assuming Checking for now)
        const senderRes = await query("SELECT * FROM accounts WHERE user_id = $1 AND type = 'Checking'", [userId]);
        const senderAcc = senderRes.rows[0];

        if (!senderAcc) {
            await query('ROLLBACK');
            throw new ValidationError('No checking account found');
        }

        if (parseFloat(senderAcc.balance) < amount) {
            await query('ROLLBACK');
            throw new ValidationError('Insufficient funds');
        }

        // Get Recipient
        const recipientRes = await query("SELECT * FROM users WHERE email = $1", [recipientEmail]);
        if (recipientRes.rows.length === 0) {
            await query('ROLLBACK');
            throw new NotFoundError('Recipient not found');
        }
        const recipientId = recipientRes.rows[0].id;
        const recipientName = recipientRes.rows[0].full_name;

        // Get Recipient Account
        const recipientAccRes = await query("SELECT * FROM accounts WHERE user_id = $1 LIMIT 1", [recipientId]);
        const recipientAcc = recipientAccRes.rows[0];

        if (!recipientAcc) {
            await query('ROLLBACK');
            throw new ValidationError('Recipient account not found');
        }

        // Prevent self-transfer
        if (userId === recipientId) {
            await query('ROLLBACK');
            throw new ValidationError('Cannot transfer to your own account');
        }

        // Debit Sender
        await query("UPDATE accounts SET balance = balance - $1 WHERE id = $2", [amount, senderAcc.id]);

        // Credit Recipient
        await query("UPDATE accounts SET balance = balance + $1 WHERE id = $2", [amount, recipientAcc.id]);

        // Record Transactions
        await query(
            "INSERT INTO transactions (user_id, type, amount, description, recipient_name, status) VALUES ($1, 'debit', $2, $3, $4, 'completed')",
            [userId, amount, `Transfer to ${recipientEmail}`, recipientName]
        );

        await query(
            "INSERT INTO transactions (user_id, type, amount, description, recipient_name, status) VALUES ($1, 'credit', $2, $3, $4, 'completed')",
            [recipientId, amount, `Received from ${userEmail}`, req.user.full_name || userEmail]
        );

        await query('COMMIT');

        // Send Notification (Fire and forget, don't block response)
        sendTransferNotification(recipientEmail, amount, userEmail).catch(err => {
            console.error('Failed to send transfer notification:', err);
        });

        res.json({ status: 'success', message: 'Transfer successful' });
    } catch (err) {
        await query('ROLLBACK');
        throw err;
    }
}));

export default router;
