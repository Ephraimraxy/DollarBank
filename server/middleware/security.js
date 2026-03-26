import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

// Helmet security headers
export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
            ],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://cdn.tailwindcss.com",
                "https://esm.sh",
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com",
            ],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: [
                "'self'",
                "https://esm.sh",
                "https://cdn.tailwindcss.com",
                "https://fonts.googleapis.com",
                "https://fonts.gstatic.com",
            ],
        },
    },
    crossOriginEmbedderPolicy: false, // Allow embedding for development
});

// HTTPS enforcement middleware
export const enforceHttps = (req, res, next) => {
    if (config.enforceHttps && req.protocol !== 'https') {
        return res.status(403).json({
            error: 'HTTPS required',
        });
    }
    next();
};

// Rate limiting
export const createRateLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: { error: message },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            res.status(429).json({
                error: message,
                retryAfter: Math.ceil(windowMs / 1000),
            });
        },
    });
};

// General API rate limiter
export const apiLimiter = createRateLimiter(
    config.rateLimitWindowMs,
    config.rateLimitMaxRequests,
    'Too many requests from this IP, please try again later'
);

// Strict rate limiter for authentication endpoints
export const authLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    5, // 5 requests per window
    'Too many authentication attempts, please try again after 15 minutes'
);

// Strict rate limiter for password reset
export const passwordResetLimiter = createRateLimiter(
    60 * 60 * 1000, // 1 hour
    3, // 3 requests per hour
    'Too many password reset attempts, please try again later'
);

// Input sanitization (Express 5 compatible - doesn't modify read-only properties)
export const sanitizeInput = (req, res, next) => {
    // Express 5 makes req.query read-only, so we can't sanitize it directly
    // express-validator already handles input validation, so this is just a pass-through
    // For PostgreSQL, we don't need MongoDB-specific sanitization
    // SQL injection is prevented by using parameterized queries (which we do)
    next();
};

// Request size limit
export const requestSizeLimit = (maxSize = '10mb') => {
    return (req, res, next) => {
        const contentLength = parseInt(req.get('content-length') || '0', 10);
        const maxBytes = parseSize(maxSize);
        
        if (contentLength > maxBytes) {
            return res.status(413).json({
                error: `Request entity too large. Maximum size is ${maxSize}`,
            });
        }
        next();
    };
};

function parseSize(size) {
    const units = { kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 };
    const match = size.match(/^(\d+)(kb|mb|gb)$/i);
    if (!match) return 10 * 1024 * 1024; // Default 10MB
    return parseInt(match[1], 10) * units[match[2].toLowerCase()];
}

