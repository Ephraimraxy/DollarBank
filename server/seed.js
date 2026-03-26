import { query } from './db.js';
import bcrypt from 'bcryptjs';

async function seed() {
    try {
        console.log('Seeding database...');

        // Check if default user exists
        const res = await query('SELECT * FROM users WHERE email = $1', ['test@gmail.com']);

        if (res.rows.length === 0) {
            console.log('Creating default user: test@gmail.com');
            const hashedPassword = await bcrypt.hash('123456', 10);

            const userRes = await query(
                'INSERT INTO users (full_name, email, password_hash, is_verified) VALUES ($1, $2, $3, TRUE) RETURNING id',
                ['Austin Keith', 'test@gmail.com', hashedPassword]
            );

            const userId = userRes.rows[0].id;

            // Create Accounts
            await query("INSERT INTO accounts (user_id, type, balance, account_number) VALUES ($1, 'Checking', 900000.00, 'CK-9928374')", [userId]);
            await query("INSERT INTO accounts (user_id, type, balance, account_number) VALUES ($1, 'Savings', 0.00, 'SV-1122334')", [userId]);

            console.log('Default user created.');
        } else {
            console.log('Default user already exists.');
        }

        // Check for Demo User
        const resDemo = await query('SELECT * FROM users WHERE email = $1', ['demo@gmail.com']);
        if (resDemo.rows.length === 0) {
            console.log('Creating demo user: demo@gmail.com');
            const hashedDemo = await bcrypt.hash('123456', 10);
            const demoRes = await query(
                'INSERT INTO users (full_name, email, password_hash, is_verified) VALUES ($1, $2, $3, TRUE) RETURNING id',
                ['Sarah Wilson', 'demo@gmail.com', hashedDemo]
            );
            const demoId = demoRes.rows[0].id;
            await query("INSERT INTO accounts (user_id, type, balance, account_number) VALUES ($1, 'Checking', 900000.00, 'CK-883344')", [demoId]);
            console.log('Demo user created.');
        } else {
            console.log('Demo user already exists.');
        }

        // Check for Admin User
        const resAdmin = await query('SELECT * FROM users WHERE email = $1', ['testadmin@gmail.com']);
        if (resAdmin.rows.length === 0) {
            console.log('Creating admin user: testadmin@gmail.com');
            const hashedAdmin = await bcrypt.hash('123456', 10);
            const adminRes = await query(
                'INSERT INTO users (full_name, email, password_hash, is_admin, is_verified) VALUES ($1, $2, $3, TRUE, TRUE) RETURNING id',
                ['Vault Admin', 'testadmin@gmail.com', hashedAdmin]
            );
            // Admin might not need accounts, but adding one for testing
            const adminId = adminRes.rows[0].id;
            await query("INSERT INTO accounts (user_id, type, balance, account_number) VALUES ($1, 'Checking', 900000.00, 'ADM-001')", [adminId]);
            console.log('Admin user created.');
        } else {
            console.log('Admin user already exists.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seed();
