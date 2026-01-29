export interface InboxMessage {
  id: string;
  user_id: string;
  campaign_id: string | null;
  campaign_contact_id: string | null;
  contact_id: string | null;
  smtp_account_id: string | null;
  from_email: string;
  to_email: string;
  subject: string | null;
  body_html: string | null;
  body_text: string | null;
  in_reply_to: string | null;
  message_id: string | null;
  is_read: boolean;
  // SARA fields
  sara_intent: string | null;
  sara_confidence: number | null;
  sara_draft_reply: string | null;
  sara_action: string | null;
  sara_status: string;
  sara_reviewed_at: string | null;
  sara_reviewed_by: string | null;
  received_at: string;
  created_at: string;
}

export interface InboxMessageWithContext extends InboxMessage {
  contact_name: string | null;
  campaign_name: string | null;
}

export interface SaraClassificationResult {
  intent: string;
  confidence: number;
  action: string;
  draft_reply: string | null;
  reasoning: string;
}

export interface SaraReviewAction {
  message_id: string;
  action: 'approve' | 'dismiss' | 'edit_and_approve';
  edited_reply?: string;
}

export interface SaraQueueStats {
  pending_review: number;
  approved_today: number;
  dismissed_today: number;
  sent_today: number;
  top_intents: { intent: string; count: number }[];
}
