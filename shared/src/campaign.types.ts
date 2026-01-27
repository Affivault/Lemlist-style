import { CampaignStatus, StepType, ContactCampaignStatus } from './enums';

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  status: CampaignStatus;
  smtp_account_id: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  timezone: string;
  send_window_start: string | null;
  send_window_end: string | null;
  send_days: string[];
  total_contacts: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignStep {
  id: string;
  campaign_id: string;
  step_order: number;
  step_type: StepType;
  subject: string | null;
  body_html: string | null;
  body_text: string | null;
  delay_days: number;
  delay_hours: number;
  delay_minutes: number;
  skip_if_replied: boolean;
  created_at: string;
  updated_at: string;
}

export interface CampaignContact {
  id: string;
  campaign_id: string;
  contact_id: string;
  status: ContactCampaignStatus;
  current_step_order: number;
  next_send_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignWithStats extends Campaign {
  steps_count: number;
  contacts_count: number;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  replied_count: number;
  bounced_count: number;
}

export interface CreateCampaignInput {
  name: string;
  smtp_account_id?: string;
  timezone?: string;
  send_window_start?: string;
  send_window_end?: string;
  send_days?: string[];
}

export interface CreateStepInput {
  step_type: StepType;
  step_order: number;
  subject?: string;
  body_html?: string;
  body_text?: string;
  delay_days?: number;
  delay_hours?: number;
  delay_minutes?: number;
  skip_if_replied?: boolean;
}

export interface UpdateStepInput extends Partial<CreateStepInput> {}
