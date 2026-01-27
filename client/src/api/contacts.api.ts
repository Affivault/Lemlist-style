import { apiClient } from './client';
import type { Contact, ContactWithTags, CreateContactInput, UpdateContactInput, PaginatedResponse, ContactsListParams, Tag } from '@lemlist/shared';

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

  bulkTag: async (contactIds: string[], tagIds: string[]) => {
    await apiClient.post('/contacts/bulk-tag', { contact_ids: contactIds, tag_ids: tagIds });
  },

  bulkUntag: async (contactIds: string[], tagIds: string[]) => {
    await apiClient.delete('/contacts/bulk-tag', {
      data: { contact_ids: contactIds, tag_ids: tagIds },
    });
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
