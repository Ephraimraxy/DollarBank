import express from 'express';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendTransferNotification } from '../services/email.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/transfer', async (req, res) => {
    const { amount, recipientEmail } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    if (!amount || !recipientEmail) return res.status(400).json({ error: 'Missing fields' });

    try {
        await query('BEGIN');

        // Get Sender Account (Assuming Checking for now)
        const senderRes = await query("SELECT * FROM accounts WHERE user_id = $1 AND type = 'Checking'", [userId]);
        const senderAcc = senderRes.rows[0];

        if (!senderAcc || parseFloat(senderAcc.balance) < amount) {
            await query('ROLLBACK');
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        // Get Recipient
        const recipientRes = await query("SELECT * FROM users WHERE email = $1", [recipientEmail]);
        if (recipientRes.rows.length === 0) {
            await query('ROLLBACK');
            return res.status(404).json({ error: 'Recipient not found' });
        }
        const recipientId = recipientRes.rows[0].id;
        const recipientName = recipientRes.rows[0].full_name;

        // Get Recipient Account
        const recipientAccRes = await query("SELECT * FROM accounts WHERE user_id = $1 LIMIT 1", [recipientId]);
        const recipientAcc = recipientAccRes.rows[0];

        // Debit Sender
        await query("UPDATE accounts SET balance = balance - $1 WHERE id = $2", [amount, senderAcc.id]);

        // Credit Recipient
        await query("UPDATE accounts SET balance = balance + $1 WHERE id = $2", [amount, recipientAcc.id]);

        // Record Transactions
        await query(
            "INSERT INTO transactions (user_id, type, amount, description, status) VALUES ($1, 'debit', $2, $3, 'completed')",
            [userId, amount, `Transfer to ${recipientEmail}`]
        );

        await query(
            "INSERT INTO transactions (user_id, type, amount, description, status) VALUES ($1, 'credit', $2, $3, 'completed')",
            [recipientId, amount, `Received from ${userEmail}`]
        );

        await query('COMMIT');

        // Send Notification (Fire and forget, don't block response)
        sendTransferNotification(recipientEmail, amount, userEmail).catch(console.error);

        res.json({ status: 'success', message: 'Transfer successful' });
    } catch (err) {
        await query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Transfer failed' });
    }
});

export default router;
