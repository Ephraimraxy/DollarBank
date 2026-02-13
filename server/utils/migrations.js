import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../db.js';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDir = path.join(__dirname, '../migrations');

// Create migrations table if it doesn't exist
async function ensureMigrationsTable() {
    await query(`
        CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

// Get executed migrations
async function getExecutedMigrations() {
    const result = await query('SELECT name FROM migrations ORDER BY executed_at');
    return result.rows.map(row => row.name);
}

// Execute a migration
async function executeMigration(filename) {
    const filePath = path.join(migrationsDir, filename);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    await query('BEGIN');
    try {
        await query(sql);
        await query('INSERT INTO migrations (name) VALUES ($1)', [filename]);
        await query('COMMIT');
        logger.info(`Migration executed: ${filename}`);
    } catch (error) {
        await query('ROLLBACK');
        throw error;
    }
}

// Run pending migrations
export async function runMigrations() {
    try {
        await ensureMigrationsTable();
        
        const executedMigrations = await getExecutedMigrations();
        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();

        const pendingMigrations = migrationFiles.filter(
            file => !executedMigrations.includes(file)
        );

        if (pendingMigrations.length === 0) {
            logger.info('No pending migrations');
            return;
        }

        logger.info(`Running ${pendingMigrations.length} pending migration(s)...`);
        
        for (const migration of pendingMigrations) {
            await executeMigration(migration);
        }

        logger.info('All migrations completed successfully');
    } catch (error) {
        logger.error('Migration failed:', error);
        throw error;
    }
}

