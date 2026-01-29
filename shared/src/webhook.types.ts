import { WebhookEventType } from './enums';

export interface WebhookEndpoint {
  id: string;
  user_id: string;
  url: string;
  label: string;
  secret: string | null;
  is_active: boolean;
  events: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateWebhookEndpointInput {
  url: string;
  label?: string;
  secret?: string;
  events: string[];
}

export interface UpdateWebhookEndpointInput {
  url?: string;
  label?: string;
  secret?: string;
  events?: string[];
  is_active?: boolean;
}

export interface WebhookDelivery {
  id: string;
  endpoint_id: string;
  event_type: string;
  payload: Record<string, any>;
  status_code: number | null;
  response_body: string | null;
  success: boolean;
  attempts: number;
  last_attempt_at: string | null;
  created_at: string;
}

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, any>;
}
