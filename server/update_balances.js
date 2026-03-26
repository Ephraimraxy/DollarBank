import { query } from './db.js';

async function updateBalances() {
    try {
        console.log('Updating all account balances to 900,000...');
        const result = await query('UPDATE accounts SET balance = 900000.00');
        console.log(`Success! Updated ${result.rowCount} accounts.`);
        process.exit(0);
    } catch (err) {
        console.error('Update error:', err);
        process.exit(1);
    }
}

updateBalances();
