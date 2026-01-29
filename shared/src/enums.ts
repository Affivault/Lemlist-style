export enum CampaignStatus {
  Draft = 'draft',
  Scheduled = 'scheduled',
  Running = 'running',
  Paused = 'paused',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export enum StepType {
  Email = 'email',
  Delay = 'delay',
}

export enum ContactCampaignStatus {
  Pending = 'pending',
  Active = 'active',
  Completed = 'completed',
  Replied = 'replied',
  Bounced = 'bounced',
  Unsubscribed = 'unsubscribed',
  Error = 'error',
}

export enum ActivityType {
  Sent = 'sent',
  Delivered = 'delivered',
  Opened = 'opened',
  Clicked = 'clicked',
  Replied = 'replied',
  Bounced = 'bounced',
  Unsubscribed = 'unsubscribed',
  Error = 'error',
}

export enum ContactSource {
  Manual = 'manual',
  CsvImport = 'csv_import',
  Api = 'api',
}

// SARA Intent Classification
export enum SaraIntent {
  Interested = 'interested',
  Meeting = 'meeting',
  Objection = 'objection',
  NotNow = 'not_now',
  Unsubscribe = 'unsubscribe',
  OutOfOffice = 'out_of_office',
  Bounce = 'bounce',
  Other = 'other',
}

// SARA Recommended Action
export enum SaraAction {
  Reply = 'reply',
  Unsubscribe = 'unsubscribe',
  StopSequence = 'stop_sequence',
  Archive = 'archive',
  Escalate = 'escalate',
}

// SARA Review Status
export enum SaraStatus {
  PendingReview = 'pending_review',
  Approved = 'approved',
  Sent = 'sent',
  Dismissed = 'dismissed',
}
