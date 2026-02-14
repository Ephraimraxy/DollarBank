-- Migration: Add profile_picture_url column to users table
-- Created: 2026-02-14
-- Description: Adds profile_picture_url column to store user profile picture URLs

-- Add profile_picture_url column to users table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_picture_url VARCHAR(500);

