import jwt from 'jsonwebtoken';
import { AuthorizationError } from '../utils/errors.js';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // Bearer TOKEN
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

export const requireAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        throw new AuthorizationError('Admin access required');
    }
    next();
};
