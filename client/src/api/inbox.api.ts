import { apiClient } from './client';
import type { InboxMessageWithContext, PaginatedResponse } from '@lemlist/shared';

export const inboxApi = {
  list: async (params?: { page?: number; limit?: number; is_read?: boolean }) => {
    const { data } = await apiClient.get<PaginatedResponse<InboxMessageWithContext>>('/inbox', { params });
    return data;
  },

  get: async (id: string) => {
    const { data } = await apiClient.get<InboxMessageWithContext>(`/inbox/${id}`);
    return data;
  },

  markRead: async (id: string) => {
    await apiClient.put(`/inbox/${id}/read`);
  },

  markAllRead: async () => {
    await apiClient.put('/inbox/mark-all-read');
  },
};
