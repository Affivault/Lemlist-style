-- Add last_inbox_sync_at to smtp_accounts for IMAP inbox sync tracking
alter table smtp_accounts add column if not exists last_inbox_sync_at timestamptz;
