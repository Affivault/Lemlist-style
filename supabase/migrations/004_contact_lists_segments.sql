-- Contact Lists and Segments
-- Adds list management and saved segments for advanced contact organization

-- ============================================
-- CONTACT LISTS
-- ============================================
create table contact_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  color text not null default '#6B7280',
  icon text default 'users',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, name)
);

create index idx_contact_lists_user_id on contact_lists(user_id);

alter table contact_lists enable row level security;
create policy "Users can manage their own contact lists"
  on contact_lists for all using (auth.uid() = user_id);

-- ============================================
-- LIST_CONTACTS (junction table)
-- ============================================
create table list_contacts (
  list_id uuid not null references contact_lists(id) on delete cascade,
  contact_id uuid not null references contacts(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (list_id, contact_id)
);

create index idx_list_contacts_contact_id on list_contacts(contact_id);

alter table list_contacts enable row level security;
create policy "Users can manage their own list contacts"
  on list_contacts for all using (
    exists (select 1 from contact_lists where contact_lists.id = list_contacts.list_id and contact_lists.user_id = auth.uid())
  );

-- ============================================
-- SAVED SEGMENTS (Dynamic Filters)
-- ============================================
create table saved_segments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  icon text default 'filter',
  color text not null default '#8B5CF6',
  -- Filter conditions stored as JSON
  -- Example: { "conditions": [{ "field": "company", "operator": "contains", "value": "tech" }], "logic": "and" }
  filter_config jsonb not null default '{"conditions":[],"logic":"and"}',
  -- Cached count (updated periodically)
  cached_count integer default 0,
  cached_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, name)
);

create index idx_saved_segments_user_id on saved_segments(user_id);

alter table saved_segments enable row level security;
create policy "Users can manage their own saved segments"
  on saved_segments for all using (auth.uid() = user_id);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
create trigger contact_lists_updated_at before update on contact_lists
  for each row execute function update_updated_at();

create trigger saved_segments_updated_at before update on saved_segments
  for each row execute function update_updated_at();

-- ============================================
-- SUPPRESSION LIST VIEW (virtual segment)
-- Note: This is handled in code as a built-in segment
-- combining is_unsubscribed = true OR is_bounced = true
-- ============================================

-- ============================================
-- DEFAULT LIST CREATION FUNCTION
-- Creates a default "All Contacts" list for new users
-- ============================================
create or replace function create_default_list_for_user()
returns trigger as $$
begin
  insert into contact_lists (user_id, name, description, is_default, icon, color)
  values (new.id, 'All Contacts', 'Default list containing all your contacts', true, 'users', '#10B981');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create default list when a new user signs up
-- Note: This may need adjustment based on your auth setup
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute function create_default_list_for_user();
