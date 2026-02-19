-- Sending domains table for domain ownership verification and DNS health tracking
CREATE TABLE IF NOT EXISTS sending_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  verification_token TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  txt_verified BOOLEAN NOT NULL DEFAULT false,
  spf_ok BOOLEAN NOT NULL DEFAULT false,
  dkim_ok BOOLEAN NOT NULL DEFAULT false,
  dmarc_ok BOOLEAN NOT NULL DEFAULT false,
  last_dns_check JSONB DEFAULT NULL,
  last_checked_at TIMESTAMPTZ DEFAULT NULL,
  detected_provider TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, domain)
);

-- RLS policies
ALTER TABLE sending_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own domains" ON sending_domains
  FOR ALL USING (auth.uid() = user_id);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_sending_domains_user ON sending_domains(user_id);
CREATE INDEX IF NOT EXISTS idx_sending_domains_domain ON sending_domains(domain);
