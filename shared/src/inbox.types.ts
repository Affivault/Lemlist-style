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
  received_at: string;
  created_at: string;
}

export interface InboxMessageWithContext extends InboxMessage {
  contact_name: string | null;
  campaign_name: string | null;
}
