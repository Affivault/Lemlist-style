export interface Contact {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  job_title: string | null;
  phone: string | null;
  linkedin_url: string | null;
  website: string | null;
  custom_fields: Record<string, string>;
  source: string;
  is_unsubscribed: boolean;
  is_bounced: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface ContactWithTags extends Contact {
  tags: Tag[];
}

export interface CreateContactInput {
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  job_title?: string;
  phone?: string;
  linkedin_url?: string;
  website?: string;
  custom_fields?: Record<string, string>;
  tag_ids?: string[];
}

export interface UpdateContactInput extends Partial<CreateContactInput> {}

export interface ContactsListParams {
  page?: number;
  limit?: number;
  search?: string;
  tag_ids?: string[];
  is_unsubscribed?: boolean;
  sort_by?: 'created_at' | 'email' | 'first_name';
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
