import express from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import logger from './utils/logger.js';
import { errorHandler } from './utils/errors.js';
import { query } from './db.js';
import { runMigrations } from './utils/migrations.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import transactionRoutes from './routes/transactions.js';
import accountsRoutes from './routes/accounts.js';
import adminRoutes from './routes/admin.js';
import profileRoutes from './routes/profile.js';

// Security middleware
import {
    securityHeaders,
    enforceHttps,
    apiLimiter,
    sanitizeInput,
    requestSizeLimit,
} from './middleware/security.js';

// Maintenance mode middleware
import { maintenanceGuard } from './middleware/maintenance.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware (must be first)
app.use(securityHeaders);
app.use(enforceHttps);

// Maintenance mode guard (blocks everything except health checks when enabled)
app.use(maintenanceGuard);

// Compression
app.use(compression());

// Request logging
app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim()),
    },
}));

// CORS configuration
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        // In development, allow all origins
        if (config.isDevelopment) {
            return callback(null, true);
        }
        
        // In production, check allowed origins
        if (config.allowedOrigins.length === 0) {
            logger.warn('⚠️  WARNING: ALLOWED_ORIGINS not set in production. Allowing all origins.');
            return callback(null, true);
        }
        
        if (config.allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            logger.warn(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
}));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestSizeLimit('10mb'));

// Input sanitization
app.use(sanitizeInput);

// Health check endpoints (before rate limiting)
app.get('/api/health', async (req, res) => {
    // If maintenance mode is ON, return 200 with maintenance flag
    // (200 keeps Railway health checks happy; frontend detects via the maintenance field)
    if (config.maintenanceMode) {
        return res.json({
            status: 'maintenance',
            maintenance: true,
            message: 'Vault ID is currently undergoing scheduled maintenance.',
            timestamp: new Date().toISOString(),
        });
    }

    try {
        // Check database connection
        await query('SELECT NOW()');
        res.json({
            status: 'healthy',
            maintenance: false,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: config.nodeEnv,
        });
    } catch (err) {
        logger.error('Health check failed:', err);
        res.status(503).json({
            status: 'unhealthy',
            maintenance: false,
            timestamp: new Date().toISOString(),
            error: 'Database connection failed',
        });
    }
});

app.get('/api/ready', async (req, res) => {
    try {
        await query('SELECT 1');
        res.json({ status: 'ready' });
    } catch (err) {
        res.status(503).json({ status: 'not ready', error: err.message });
    }
});

// Database test route (protected by rate limiting)
app.get('/api/db-test', apiLimiter, async (req, res, next) => {
    try {
        const result = await query('SELECT NOW()');
        res.json({ status: 'connected', time: result.rows[0].now });
    } catch (err) {
        next(err);
    }
});

// API Routes with rate limiting
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);

// Serve uploaded profile pictures
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist'), {
    // Don't serve index.html for static file requests
    index: false,
}));

// Handle missing CSS file gracefully
app.get('/index.css', (req, res) => {
    res.type('text/css');
    res.send('/* CSS file not found - styles are inline or in JS bundle */');
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
// Only catch non-API, non-static file routes
app.get(/^(?!\/api|\/assets|\/index\.css).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Global Error Handler (must be last)
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
    try {
        // Run migrations on startup (only runs pending migrations)
        // Always run in production (Railway sets NODE_ENV=production)
        // Can also be forced with RUN_MIGRATIONS=true
        const shouldRunMigrations = config.isProduction || process.env.RUN_MIGRATIONS === 'true';
        
        if (shouldRunMigrations) {
            logger.info('🔄 Running database migrations...');
            try {
                await runMigrations();
                logger.info('✅ Database migrations completed successfully');
            } catch (migrationError) {
                logger.error('❌ Migration failed:', migrationError);
                // Don't exit - allow server to start even if migrations fail
                // (migrations might have already been run)
                logger.warn('⚠️  Continuing server startup despite migration error');
            }
        } else {
            logger.info('⏭️  Skipping migrations (development mode - set NODE_ENV=production or RUN_MIGRATIONS=true to run)');
        }

        // Start server
        app.listen(config.port, '0.0.0.0', () => {
            logger.info(`🚀 Server is running on port ${config.port}`);
            logger.info(`📝 Environment: ${config.nodeEnv}`);
            logger.info(`🔒 HTTPS enforcement: ${config.enforceHttps}`);
            logger.info(`🔧 Maintenance mode: ${config.maintenanceMode ? 'ON' : 'OFF'}`);
            logger.info(`🌐 Allowed origins: ${config.allowedOrigins.join(', ')}`);
            logger.info(`🌍 Listening on 0.0.0.0:${config.port} (Railway compatible)`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    process.exit(0);
});
