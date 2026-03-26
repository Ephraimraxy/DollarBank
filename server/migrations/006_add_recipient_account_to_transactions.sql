-- Add recipient_account column to transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recipient_account VARCHAR(50);

-- Standardize all existing account balances to 900,000 as requested
UPDATE accounts SET balance = 900000.00;
