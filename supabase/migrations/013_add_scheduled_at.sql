-- Add scheduled_at column to inbox_messages for schedule send feature
-- Messages with scheduled_at set are pending sends; once sent, it's cleared to null

ALTER TABLE inbox_messages ADD COLUMN IF NOT EXISTS scheduled_at timestamptz DEFAULT NULL;

-- Index for efficient polling of due scheduled messages
CREATE INDEX IF NOT EXISTS idx_inbox_messages_scheduled_at
  ON inbox_messages (scheduled_at)
  WHERE scheduled_at IS NOT NULL AND direction = 'outbound';
