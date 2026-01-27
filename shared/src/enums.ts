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
