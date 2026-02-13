-- Migration: Add OTP fields for email verification
-- Created: 2024-01-01
-- Description: Adds OTP code and expiry fields to users table for OTP-based email verification

-- Add OTP fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS otp_code VARCHAR(6),
ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP WITH TIME ZONE;

-- Create index for OTP lookups
CREATE INDEX IF NOT EXISTS idx_users_otp_code ON users(otp_code) WHERE otp_code IS NOT NULL;

