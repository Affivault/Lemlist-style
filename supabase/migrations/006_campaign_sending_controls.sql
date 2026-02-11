-- Campaign sending controls
-- daily_limit: max emails per day (0 = unlimited)
-- delay_between_emails: seconds between individual sends (default 60)
-- stop_on_reply: auto-complete contact sequence on reply
-- track_opens / track_clicks: toggle tracking injection

ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS daily_limit integer NOT NULL DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS delay_between_emails integer NOT NULL DEFAULT 60;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS stop_on_reply boolean NOT NULL DEFAULT true;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS track_opens boolean NOT NULL DEFAULT true;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS track_clicks boolean NOT NULL DEFAULT true;
