-- A/B subject line testing: alternate subject for 50/50 split
ALTER TABLE campaign_steps ADD COLUMN IF NOT EXISTS subject_b text;
