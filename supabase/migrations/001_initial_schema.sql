-- Lemlist App - Initial Database Schema
-- Run this migration against your Supabase project

-- ============================================
-- CONTACTS
-- ============================================
create table contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  first_name text,
  last_name text,
  company text,
  job_title text,
  phone text,
  linkedin_url text,
  website text,
  custom_fields jsonb not null default '{}',
  source text not null default 'manual',
  is_unsubscribed boolean not null default false,
  is_bounced boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, email)
);

create index idx_contacts_user_id on contacts(user_id);
create index idx_contacts_email on contacts(email);
create index idx_contacts_created_at on contacts(created_at);

alter table contacts enable row level security;
create policy "Users can manage their own contacts"
  on contacts for all using (auth.uid() = user_id);

-- ============================================
-- TAGS
-- ============================================
create table tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#6B7280',
  created_at timestamptz not null default now(),
  unique(user_id, name)
);

create index idx_tags_user_id on tags(user_id);

alter table tags enable row level security;
create policy "Users can manage their own tags"
  on tags for all using (auth.uid() = user_id);

-- ============================================
-- CONTACT_TAGS (junction)
-- ============================================
create table contact_tags (
  contact_id uuid not null references contacts(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (contact_id, tag_id)
);

create index idx_contact_tags_tag_id on contact_tags(tag_id);

alter table contact_tags enable row level security;
create policy "Users can manage their own contact tags"
  on contact_tags for all using (
    exists (select 1 from contacts where contacts.id = contact_tags.contact_id and contacts.user_id = auth.uid())
  );

-- ============================================
-- SMTP ACCOUNTS
-- ============================================
create table smtp_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  email_address text not null,
  smtp_host text not null,
  smtp_port integer not null,
  smtp_secure boolean not null default false,
  smtp_user text not null,
  smtp_pass_encrypted text not null,
  imap_host text,
  imap_port integer,
  imap_secure boolean,
  daily_send_limit integer not null default 200,
  sends_today integer not null default 0,
  last_send_reset_at timestamptz not null default now(),
  is_verified boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_smtp_accounts_user_id on smtp_accounts(user_id);

alter table smtp_accounts enable row level security;
create policy "Users can manage their own SMTP accounts"
  on smtp_accounts for all using (auth.uid() = user_id);

-- ============================================
-- CAMPAIGNS
-- ============================================
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  status text not null default 'draft',
  smtp_account_id uuid references smtp_accounts(id) on delete set null,
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  timezone text not null default 'UTC',
  send_window_start text,
  send_window_end text,
  send_days text[] not null default '{"monday","tuesday","wednesday","thursday","friday"}',
  total_contacts integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_campaigns_user_id on campaigns(user_id);
create index idx_campaigns_status on campaigns(status);

alter table campaigns enable row level security;
create policy "Users can manage their own campaigns"
  on campaigns for all using (auth.uid() = user_id);

-- ============================================
-- CAMPAIGN STEPS
-- ============================================
create table campaign_steps (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  step_order integer not null default 0,
  step_type text not null default 'email',
  subject text,
  body_html text,
  body_text text,
  delay_days integer not null default 0,
  delay_hours integer not null default 0,
  delay_minutes integer not null default 0,
  skip_if_replied boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_campaign_steps_campaign_id on campaign_steps(campaign_id);

alter table campaign_steps enable row level security;
create policy "Users can manage their own campaign steps"
  on campaign_steps for all using (
    exists (select 1 from campaigns where campaigns.id = campaign_steps.campaign_id and campaigns.user_id = auth.uid())
  );

-- ============================================
-- CAMPAIGN CONTACTS
-- ============================================
create table campaign_contacts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  contact_id uuid not null references contacts(id) on delete cascade,
  status text not null default 'pending',
  current_step_order integer not null default 0,
  next_send_at timestamptz,
  completed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(campaign_id, contact_id)
);

create index idx_campaign_contacts_campaign_id on campaign_contacts(campaign_id);
create index idx_campaign_contacts_contact_id on campaign_contacts(contact_id);
create index idx_campaign_contacts_status on campaign_contacts(status);
create index idx_campaign_contacts_next_send on campaign_contacts(next_send_at);

alter table campaign_contacts enable row level security;
create policy "Users can manage their own campaign contacts"
  on campaign_contacts for all using (
    exists (select 1 from campaigns where campaigns.id = campaign_contacts.campaign_id and campaigns.user_id = auth.uid())
  );

-- ============================================
-- CAMPAIGN ACTIVITIES
-- ============================================
create table campaign_activities (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  campaign_contact_id uuid not null references campaign_contacts(id) on delete cascade,
  step_id uuid references campaign_steps(id) on delete set null,
  contact_id uuid not null references contacts(id) on delete cascade,
  activity_type text not null,
  metadata jsonb not null default '{}',
  message_id text,
  occurred_at timestamptz not null default now()
);

create index idx_campaign_activities_campaign_id on campaign_activities(campaign_id);
create index idx_campaign_activities_contact_id on campaign_activities(contact_id);
create index idx_campaign_activities_type on campaign_activities(activity_type);
create index idx_campaign_activities_occurred_at on campaign_activities(occurred_at);

alter table campaign_activities enable row level security;
create policy "Users can manage their own campaign activities"
  on campaign_activities for all using (
    exists (select 1 from campaigns where campaigns.id = campaign_activities.campaign_id and campaigns.user_id = auth.uid())
  );

-- ============================================
-- INBOX MESSAGES
-- ============================================
create table inbox_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete set null,
  campaign_contact_id uuid references campaign_contacts(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null,
  smtp_account_id uuid references smtp_accounts(id) on delete set null,
  from_email text not null,
  to_email text not null,
  subject text,
  body_html text,
  body_text text,
  in_reply_to text,
  message_id text,
  is_read boolean not null default false,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index idx_inbox_messages_user_id on inbox_messages(user_id);
create index idx_inbox_messages_campaign_id on inbox_messages(campaign_id);
create index idx_inbox_messages_is_read on inbox_messages(is_read);
create index idx_inbox_messages_received_at on inbox_messages(received_at);

alter table inbox_messages enable row level security;
create policy "Users can manage their own inbox messages"
  on inbox_messages for all using (auth.uid() = user_id);

-- ============================================
-- EMAIL TEMPLATES
-- ============================================
create table email_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  subject text,
  body_html text,
  body_text text,
  category text not null default 'general',
  is_shared boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_email_templates_user_id on email_templates(user_id);

alter table email_templates enable row level security;
create policy "Users can manage their own templates"
  on email_templates for all using (auth.uid() = user_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger contacts_updated_at before update on contacts
  for each row execute function update_updated_at();
create trigger smtp_accounts_updated_at before update on smtp_accounts
  for each row execute function update_updated_at();
create trigger campaigns_updated_at before update on campaigns
  for each row execute function update_updated_at();
create trigger campaign_steps_updated_at before update on campaign_steps
  for each row execute function update_updated_at();
create trigger campaign_contacts_updated_at before update on campaign_contacts
  for each row execute function update_updated_at();
create trigger email_templates_updated_at before update on email_templates
  for each row execute function update_updated_at();
