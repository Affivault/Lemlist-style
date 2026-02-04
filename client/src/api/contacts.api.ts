import { apiClient } from './client';
import type {
  Contact,
  ContactWithTags,
  CreateContactInput,
  UpdateContactInput,
  PaginatedResponse,
  ContactsListParams,
  Tag,
  ContactList,
  CreateContactListInput,
  UpdateContactListInput,
  SavedSegment,
  CreateSegmentInput,
  UpdateSegmentInput,
  FilterConfig,
  BulkActionResult,
} from '@lemlist/shared';

export interface ContactStats {
  total: number;
  unsubscribed: number;
  bounced: number;
  verified: number;
  active: number;
}

export const contactsApi = {
  list: async (params?: ContactsListParams) => {
    const { data } = await apiClient.get<PaginatedResponse<ContactWithTags>>('/contacts', { params });
    return data;
  },

  get: async (id: string) => {
    const { data } = await apiClient.get<ContactWithTags>(`/contacts/${id}`);
    return data;
  },

  create: async (input: CreateContactInput) => {
    const { data } = await apiClient.post<Contact>('/contacts', input);
    return data;
  },

  update: async (id: string, input: UpdateContactInput) => {
    const { data } = await apiClient.put<Contact>(`/contacts/${id}`, input);
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/contacts/${id}`);
  },

  import: async (file: File, columnMapping: Record<string, string>) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('columnMapping', JSON.stringify(columnMapping));
    const { data } = await apiClient.post<{ imported: number; errors: number }>(
      '/contacts/import',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  },

  export: async (contactIds?: string[], format: 'csv' | 'json' = 'csv') => {
    const { data } = await apiClient.post('/contacts/export', { contact_ids: contactIds, format }, {
      responseType: format === 'csv' ? 'blob' : 'json',
    });
    return data;
  },

  bulkTag: async (contactIds: string[], tagIds: string[]) => {
    await apiClient.post('/contacts/bulk-tag', { contact_ids: contactIds, tag_ids: tagIds });
  },

  bulkUntag: async (contactIds: string[], tagIds: string[]) => {
    await apiClient.delete('/contacts/bulk-tag', {
      data: { contact_ids: contactIds, tag_ids: tagIds },
    });
  },

  bulkDelete: async (contactIds: string[]) => {
    const { data } = await apiClient.post<{ deleted: number }>('/contacts/bulk-delete', { contact_ids: contactIds });
    return data;
  },

  getStats: async () => {
    const { data } = await apiClient.get<ContactStats>('/contacts/stats');
    return data;
  },
};

// Lists API
export const listsApi = {
  list: async () => {
    const { data } = await apiClient.get<ContactList[]>('/lists');
    return data;
  },

  get: async (id: string) => {
    const { data } = await apiClient.get<ContactList>(`/lists/${id}`);
    return data;
  },

  create: async (input: CreateContactListInput) => {
    const { data } = await apiClient.post<ContactList>('/lists', input);
    return data;
  },

  update: async (id: string, input: UpdateContactListInput) => {
    const { data } = await apiClient.put<ContactList>(`/lists/${id}`, input);
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/lists/${id}`);
  },

  addContacts: async (listId: string, contactIds: string[]) => {
    const { data } = await apiClient.post<BulkActionResult>(`/lists/${listId}/contacts`, { contact_ids: contactIds });
    return data;
  },

  removeContacts: async (listId: string, contactIds: string[]) => {
    const { data } = await apiClient.delete<BulkActionResult>(`/lists/${listId}/contacts`, {
      data: { contact_ids: contactIds },
    });
    return data;
  },

  getContacts: async (listId: string) => {
    const { data } = await apiClient.get<{ contact_ids: string[] }>(`/lists/${listId}/contacts`);
    return data.contact_ids;
  },
};

// Segments API
export const segmentsApi = {
  list: async () => {
    const { data } = await apiClient.get<SavedSegment[]>('/segments');
    return data;
  },

  get: async (id: string) => {
    const { data } = await apiClient.get<SavedSegment>(`/segments/${id}`);
    return data;
  },

  create: async (input: CreateSegmentInput) => {
    const { data } = await apiClient.post<SavedSegment>('/segments', input);
    return data;
  },

  update: async (id: string, input: UpdateSegmentInput) => {
    const { data } = await apiClient.put<SavedSegment>(`/segments/${id}`, input);
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/segments/${id}`);
  },

  getContacts: async (segmentId: string) => {
    const { data } = await apiClient.get<{ contact_ids: string[] }>(`/segments/${segmentId}/contacts`);
    return data.contact_ids;
  },

  refresh: async (id: string) => {
    const { data } = await apiClient.post<SavedSegment>(`/segments/${id}/refresh`);
    return data;
  },

  preview: async (filterConfig: FilterConfig) => {
    const { data } = await apiClient.post<{ count: number }>('/segments/preview', { filter_config: filterConfig });
    return data.count;
  },
};

export const tagsApi = {
  list: async () => {
    const { data } = await apiClient.get<Tag[]>('/tags');
    return data;
  },

  create: async (input: { name: string; color?: string }) => {
    const { data } = await apiClient.post<Tag>('/tags', input);
    return data;
  },

  update: async (id: string, input: { name?: string; color?: string }) => {
    const { data } = await apiClient.put<Tag>(`/tags/${id}`, input);
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/tags/${id}`);
  },
};
