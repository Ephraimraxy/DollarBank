import { query } from './db.js';
import { runMigrations } from './utils/migrations.js';
import logger from './utils/logger.js';

async function initDb() {
    try {
        logger.info('Initializing database...');
        
        // Run migrations
        await runMigrations();
        
        logger.info('Database initialized successfully.');
        process.exit(0);
    } catch (err) {
        logger.error('Error initializing database:', err);
        process.exit(1);
    }
}

initDb();
