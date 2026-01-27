import { ActivityType } from './enums';

export interface CampaignActivity {
  id: string;
  campaign_id: string;
  campaign_contact_id: string;
  step_id: string | null;
  contact_id: string;
  activity_type: ActivityType;
  metadata: Record<string, unknown>;
  message_id: string | null;
  occurred_at: string;
}

export interface CampaignAnalytics {
  campaign_id: string;
  total_contacts: number;
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
  bounced: number;
  errors: number;
  open_rate: number;
  click_rate: number;
  reply_rate: number;
  bounce_rate: number;
}

export interface OverviewAnalytics {
  total_campaigns: number;
  active_campaigns: number;
  total_contacts: number;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  total_replied: number;
  avg_open_rate: number;
  avg_click_rate: number;
  avg_reply_rate: number;
}

export interface ContactActivityItem {
  id: string;
  activity_type: ActivityType;
  campaign_name: string;
  step_subject: string | null;
  metadata: Record<string, unknown>;
  occurred_at: string;
}

export interface EmailTemplate {
  id: string;
  user_id: string;
  name: string;
  subject: string | null;
  body_html: string | null;
  body_text: string | null;
  category: string;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateInput {
  name: string;
  subject?: string;
  body_html?: string;
  body_text?: string;
  category?: string;
}
