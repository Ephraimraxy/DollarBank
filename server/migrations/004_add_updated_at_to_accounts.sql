-- Migration: Add updated_at column to accounts table if missing
-- Created: 2026-02-14
-- Description: Adds updated_at column to accounts table if it doesn't exist (for existing databases)

-- Add updated_at column to accounts table if it doesn't exist
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Update existing rows to have a value for updated_at if it was just added
UPDATE accounts 
SET updated_at = CURRENT_TIMESTAMP 
WHERE updated_at IS NULL;

-- Ensure the trigger function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate the trigger to ensure it's active and correctly defined
DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

