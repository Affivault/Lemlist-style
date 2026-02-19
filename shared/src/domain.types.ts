export interface SendingDomain {
  id: string;
  user_id: string;
  domain: string;
  /** Unique token for TXT ownership verification */
  verification_token: string;
  /** Overall domain verification status */
  is_verified: boolean;
  /** Individual DNS record statuses */
  txt_verified: boolean;
  spf_ok: boolean;
  dkim_ok: boolean;
  dmarc_ok: boolean;
  /** Last DNS check results (stored as JSON) */
  last_dns_check: DnsCheckResult | null;
  last_checked_at: string | null;
  /** Provider detected from MX records */
  detected_provider: string | null;
  created_at: string;
  updated_at: string;
}

export interface DnsCheckResult {
  mx: { found: boolean; records: Array<{ exchange: string; priority: number }> };
  spf: { found: boolean; record: string | null; valid: boolean; includes_provider: boolean };
  dkim: { found: boolean; selector: string | null; note: string };
  dmarc: { found: boolean; record: string | null; policy: string | null };
  verification_txt: { found: boolean };
  provider_hint: string | null;
}

export interface DnsRecordInstruction {
  type: 'TXT' | 'CNAME' | 'MX';
  host: string;
  value: string;
  purpose: string;
  status: 'verified' | 'missing' | 'warning';
}

export interface CreateDomainInput {
  domain: string;
}

export interface DomainVerifyResponse {
  domain: SendingDomain;
  dns: DnsCheckResult;
  records: DnsRecordInstruction[];
}
