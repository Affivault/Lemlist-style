-- =============================================
-- MIGRATION 008: Fix missing columns + include_unsubscribe
-- =============================================

-- These columns were in the original CREATE TABLE but if the table
-- already existed before they were added, they would be missing.
-- This causes the sequence engine query to fail silently and loop.
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_unsubscribed boolean NOT NULL DEFAULT false;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_bounced boolean NOT NULL DEFAULT false;

-- Campaign setting: include unsubscribe link in emails (default off)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS include_unsubscribe boolean NOT NULL DEFAULT false;

-- Campaign delay range (random delay between min and max seconds)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS delay_between_emails_min integer NOT NULL DEFAULT 50;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS delay_between_emails_max integer NOT NULL DEFAULT 200;
