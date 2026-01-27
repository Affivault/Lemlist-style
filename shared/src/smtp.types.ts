export interface SmtpAccount {
  id: string;
  user_id: string;
  label: string;
  email_address: string;
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  smtp_user: string;
  imap_host: string | null;
  imap_port: number | null;
  imap_secure: boolean | null;
  daily_send_limit: number;
  sends_today: number;
  last_send_reset_at: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSmtpAccountInput {
  label: string;
  email_address: string;
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  smtp_user: string;
  smtp_pass: string;
  imap_host?: string;
  imap_port?: number;
  imap_secure?: boolean;
  daily_send_limit?: number;
}

export interface UpdateSmtpAccountInput extends Partial<CreateSmtpAccountInput> {}

export interface SmtpPreset {
  name: string;
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  imap_host: string;
  imap_port: number;
  imap_secure: boolean;
}

export const SMTP_PRESETS: SmtpPreset[] = [
  {
    name: 'Gmail',
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_secure: false,
    imap_host: 'imap.gmail.com',
    imap_port: 993,
    imap_secure: true,
  },
  {
    name: 'Outlook / Microsoft 365',
    smtp_host: 'smtp.office365.com',
    smtp_port: 587,
    smtp_secure: false,
    imap_host: 'outlook.office365.com',
    imap_port: 993,
    imap_secure: true,
  },
  {
    name: 'Yahoo Mail',
    smtp_host: 'smtp.mail.yahoo.com',
    smtp_port: 587,
    smtp_secure: false,
    imap_host: 'imap.mail.yahoo.com',
    imap_port: 993,
    imap_secure: true,
  },
];
