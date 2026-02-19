-- Email templates for individual emails
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  body_html TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'custom',
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_preset BOOLEAN NOT NULL DEFAULT false,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own email templates" ON email_templates
  FOR ALL USING (auth.uid() = user_id OR is_preset = true);

CREATE INDEX IF NOT EXISTS idx_email_templates_user ON email_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);

-- Sequence templates for multi-step campaign blueprints
CREATE TABLE IF NOT EXISTS sequence_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'custom',
  steps JSONB NOT NULL DEFAULT '[]',
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_preset BOOLEAN NOT NULL DEFAULT false,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE sequence_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sequence templates" ON sequence_templates
  FOR ALL USING (auth.uid() = user_id OR is_preset = true);

CREATE INDEX IF NOT EXISTS idx_sequence_templates_user ON sequence_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_sequence_templates_category ON sequence_templates(category);
