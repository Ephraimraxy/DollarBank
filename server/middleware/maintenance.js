import { config } from '../config/index.js';
import logger from '../utils/logger.js';

/**
 * Maintenance Mode Middleware
 * 
 * When MAINTENANCE_MODE=true is set in environment variables,
 * all requests are blocked with a 503 response EXCEPT:
 *   - /api/health (so Railway health checks still pass)
 *   - /api/ready  (so Railway readiness checks still pass)
 */
export function maintenanceGuard(req, res, next) {
    if (!config.maintenanceMode) {
        return next();
    }

    // Always allow health/ready checks so Railway doesn't restart the service
    if (req.path === '/api/health' || req.path === '/api/ready') {
        return next();
    }

    // For API requests, return JSON 503
    if (req.path.startsWith('/api')) {
        logger.info(`🔧 Maintenance mode — blocked API request: ${req.method} ${req.path}`);
        return res.status(503).json({
            maintenance: true,
            message: 'Vault ID is currently undergoing scheduled maintenance. Please try again shortly.',
        });
    }

    // For page requests, let the SPA load — the frontend will detect maintenance mode
    // and show its own maintenance page
    return next();
}
