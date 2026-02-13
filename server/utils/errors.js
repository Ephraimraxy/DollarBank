import logger from './logger.js';

export class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.name = this.constructor.name;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message, errors = []) {
        super(message, 400, true);
        this.errors = errors;
    }
}

export class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401, true);
    }
}

export class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403, true);
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404, true);
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409, true);
    }
}

export const errorHandler = (err, req, res, next) => {
    // Log error
    logger.error('Error occurred:', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        user: req.user?.id || 'anonymous',
    });

    // Operational errors: send message to client
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            error: err.message,
            ...(err.errors && { errors: err.errors }),
        });
    }

    // Programming errors: don't leak error details
    res.status(500).json({
        error: config.isProduction 
            ? 'An unexpected error occurred' 
            : err.message,
    });
};

export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

