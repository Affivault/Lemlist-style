-- 012: User settings table for profile, notifications, preferences, SARA config
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  -- Profile
  first_name text DEFAULT '',
  last_name text DEFAULT '',
  company text DEFAULT '',
  job_title text DEFAULT '',
  timezone text DEFAULT 'America/New_York',
  -- Notifications
  email_notifications boolean DEFAULT true,
  campaign_alerts boolean DEFAULT true,
  reply_notifications boolean DEFAULT true,
  weekly_digest boolean DEFAULT false,
  -- Preferences
  default_signature text DEFAULT '',
  theme text DEFAULT 'system',
  -- SARA AI
  sara_enabled boolean DEFAULT true,
  sara_auto_classify boolean DEFAULT true,
  sara_auto_execute boolean DEFAULT true,
  sara_confidence_threshold integer DEFAULT 85,
  sara_auto_unsubscribe boolean DEFAULT true,
  sara_auto_bounce boolean DEFAULT true,
  sara_draft_replies boolean DEFAULT true,
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for fast lookup by user
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_settings_updated_at ON user_settings;
CREATE TRIGGER trg_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();

-- RLS policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);
