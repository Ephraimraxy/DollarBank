import express from 'express';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', asyncHandler(async (req, res) => {
    const result = await query(
        'SELECT * FROM accounts WHERE user_id = $1 ORDER BY id ASC',
        [req.user.id]
    );
    res.json(result.rows);
}));

export default router;
