import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler, ValidationError, NotFoundError } from '../utils/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/profile-pictures');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: userId_timestamp.extension
        const userId = req.user.id;
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `${userId}_${timestamp}${ext}`);
    },
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new ValidationError('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter,
});

// All routes require authentication
router.use(authenticateToken);

// Upload profile picture
router.post('/picture', upload.single('picture'), asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ValidationError('No file uploaded');
    }

    const userId = req.user.id;
    const fileUrl = `/uploads/profile-pictures/${req.file.filename}`;

    // Delete old profile picture if exists
    const userResult = await query('SELECT profile_picture_url FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
        throw new NotFoundError('User not found');
    }

    const oldPictureUrl = userResult.rows[0].profile_picture_url;
    if (oldPictureUrl && oldPictureUrl.startsWith('/uploads/profile-pictures/')) {
        const oldFilePath = path.join(__dirname, '../../', oldPictureUrl);
        if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
        }
    }

    // Update user profile picture URL
    await query(
        'UPDATE users SET profile_picture_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [fileUrl, userId]
    );

    res.json({
        success: true,
        profilePictureUrl: fileUrl,
        message: 'Profile picture uploaded successfully',
    });
}));

// Delete profile picture
router.delete('/picture', asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const userResult = await query('SELECT profile_picture_url FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
        throw new NotFoundError('User not found');
    }

    const pictureUrl = userResult.rows[0].profile_picture_url;
    if (pictureUrl && pictureUrl.startsWith('/uploads/profile-pictures/')) {
        const filePath = path.join(__dirname, '../../', pictureUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    // Remove profile picture URL from database
    await query(
        'UPDATE users SET profile_picture_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [userId]
    );

    res.json({
        success: true,
        message: 'Profile picture deleted successfully',
    });
}));

// Get user profile (including picture URL)
router.get('/', asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const result = await query(
        'SELECT id, full_name, email, profile_picture_url, is_admin, is_verified, created_at FROM users WHERE id = $1',
        [userId]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('User not found');
    }

    res.json(result.rows[0]);
}));

export default router;

