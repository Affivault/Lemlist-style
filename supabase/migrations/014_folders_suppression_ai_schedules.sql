-- ============================================================================
-- Migration 014: Folders, auto-suppression, AI tagging, exclusive list-campaign locking
-- ============================================================================

-- ── 1. CAMPAIGN FOLDERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaign_folders (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  color       TEXT        DEFAULT '#6366F1',
  icon        TEXT        DEFAULT 'folder',
  position    INTEGER     DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_campaign_folders_user ON campaign_folders(user_id);

-- Add folder_id to campaigns
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES campaign_folders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_campaigns_folder ON campaigns(folder_id);


-- ── 2. LIST FOLDERS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS list_folders (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  color       TEXT        DEFAULT '#10B981',
  icon        TEXT        DEFAULT 'folder',
  position    INTEGER     DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_list_folders_user ON list_folders(user_id);

-- Add folder_id + is_trashed to contact_lists
ALTER TABLE contact_lists
  ADD COLUMN IF NOT EXISTS folder_id   UUID    REFERENCES list_folders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_trashed  BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS trashed_at  TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_contact_lists_folder  ON contact_lists(folder_id);
CREATE INDEX IF NOT EXISTS idx_contact_lists_trashed ON contact_lists(is_trashed);


-- ── 3. EXCLUSIVE CAMPAIGN ↔ LIST BINDING ──────────────────────────────────
-- A campaign is bound to a single lead list. Contacts can only be added to
-- the campaign if they're in that bound list.
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS list_id UUID REFERENCES contact_lists(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_campaigns_list ON campaigns(list_id);


-- ── 4. AUTO-SUPPRESSION ON BOUNCE ─────────────────────────────────────────
-- Trigger that auto-adds a contact to suppression_list when is_bounced flips true.
CREATE OR REPLACE FUNCTION auto_suppress_bounced_contact()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_bounced = TRUE AND (OLD.is_bounced IS NULL OR OLD.is_bounced = FALSE) THEN
    INSERT INTO suppression_list (user_id, email, reason, notes)
    VALUES (NEW.user_id, LOWER(NEW.email), 'bounced',
            'Auto-suppressed after bounce on ' || NOW()::TEXT)
    ON CONFLICT (user_id, email) DO UPDATE
      SET reason = 'bounced', updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_suppress_bounce ON contacts;
CREATE TRIGGER trg_auto_suppress_bounce
  AFTER UPDATE OF is_bounced ON contacts
  FOR EACH ROW EXECUTE FUNCTION auto_suppress_bounced_contact();


-- ── 5. AI TAG SETTINGS + STORAGE ─────────────────────────────────────────
-- Per-user toggle for AI auto-tagging
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS ai_tagging_enabled BOOLEAN DEFAULT TRUE;

-- Per-message custom tag (separate from sara_intent which is the AI classification)
-- We reuse sara_intent for the AI-auto tag and add a manual_tag field for overrides.
ALTER TABLE inbox_messages
  ADD COLUMN IF NOT EXISTS manual_tag TEXT,
  ADD COLUMN IF NOT EXISTS ai_tag_locked BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_inbox_manual_tag ON inbox_messages(manual_tag);


-- ── 6. DEFAULT SENDING SCHEDULES ──────────────────────────────────────────
-- User can save reusable schedules
CREATE TABLE IF NOT EXISTS sending_schedules (
  id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                TEXT         NOT NULL,
  timezone            TEXT         DEFAULT 'UTC',
  send_window_start   TEXT         DEFAULT '09:00',
  send_window_end     TEXT         DEFAULT '17:00',
  send_days           TEXT[]       DEFAULT ARRAY['mon','tue','wed','thu','fri'],
  is_default          BOOLEAN      DEFAULT FALSE,
  created_at          TIMESTAMPTZ  DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_sending_schedules_user ON sending_schedules(user_id);

-- Ensure only one default schedule per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_sending_schedules_default_unique
  ON sending_schedules(user_id) WHERE is_default = TRUE;


-- ── 7. RLS POLICIES FOR NEW TABLES ───────────────────────────────────────
ALTER TABLE campaign_folders   ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_folders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE sending_schedules  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaign_folders_user_own"  ON campaign_folders  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "list_folders_user_own"      ON list_folders      FOR ALL USING (user_id = auth.uid());
CREATE POLICY "sending_schedules_user_own" ON sending_schedules FOR ALL USING (user_id = auth.uid());


-- ── 8. UPDATED_AT TRIGGERS ───────────────────────────────────────────────
CREATE TRIGGER trg_campaign_folders_updated_at  BEFORE UPDATE ON campaign_folders  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_list_folders_updated_at      BEFORE UPDATE ON list_folders      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_sending_schedules_updated_at BEFORE UPDATE ON sending_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at();
