-- Add star, archive, and forwarding support to inbox_messages
ALTER TABLE inbox_messages ADD COLUMN IF NOT EXISTS is_starred boolean DEFAULT false;
ALTER TABLE inbox_messages ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false;
ALTER TABLE inbox_messages ADD COLUMN IF NOT EXISTS direction text DEFAULT 'inbound';
ALTER TABLE inbox_messages ADD COLUMN IF NOT EXISTS thread_id text;

CREATE INDEX IF NOT EXISTS idx_inbox_messages_starred ON inbox_messages(user_id, is_starred) WHERE is_starred = true;
CREATE INDEX IF NOT EXISTS idx_inbox_messages_archived ON inbox_messages(user_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_thread ON inbox_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_direction ON inbox_messages(direction);
