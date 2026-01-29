export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  rate_limit: number;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CreateApiKeyInput {
  name: string;
  scopes?: string[];
  rate_limit?: number;
  expires_at?: string;
}

export interface ApiKeyCreatedResponse {
  key: ApiKey;
  raw_key: string; // Only shown once at creation time
}
