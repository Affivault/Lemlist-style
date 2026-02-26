import { apiClient } from './client';
import type { InboxMessageWithContext, PaginatedResponse } from '@lemlist/shared';

export const inboxApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    is_read?: boolean;
    is_starred?: boolean;
    folder?: string;
    sara_status?: string;
    sara_intent?: string;
    search?: string;
  }) => {
    const { data } = await apiClient.get<PaginatedResponse<InboxMessageWithContext>>('/inbox', { params });
    return data;
  },

  get: async (id: string) => {
    const { data } = await apiClient.get<InboxMessageWithContext>(`/inbox/${id}`);
    return data;
  },

  getThread: async (id: string) => {
    const { data } = await apiClient.get<InboxMessageWithContext[]>(`/inbox/${id}/thread`);
    return data;
  },

  markRead: async (id: string) => {
    await apiClient.put(`/inbox/${id}/read`);
  },

  markUnread: async (id: string) => {
    await apiClient.put(`/inbox/${id}/unread`);
  },

  markAllRead: async () => {
    await apiClient.put('/inbox/mark-all-read');
  },

  toggleStar: async (id: string) => {
    const { data } = await apiClient.put<{ is_starred: boolean }>(`/inbox/${id}/star`);
    return data;
  },

  archive: async (id: string) => {
    await apiClient.put(`/inbox/${id}/archive`);
  },

  unarchive: async (id: string) => {
    await apiClient.put(`/inbox/${id}/unarchive`);
  },

  reply: async (id: string, body: string, smtp_account_id?: string, body_html?: string) => {
    const { data } = await apiClient.post<{ success: boolean; message_id: string }>(`/inbox/${id}/reply`, { body, body_html, smtp_account_id });
    return data;
  },

  forward: async (id: string, to: string, note?: string, smtp_account_id?: string, body_html?: string) => {
    const { data } = await apiClient.post<{ success: boolean; message_id: string }>(`/inbox/${id}/forward`, { to, note, body_html, smtp_account_id });
    return data;
  },

  aiReplyAssist: async (id: string, prompt: string) => {
    const { data } = await apiClient.post<{ html: string; text: string }>(`/inbox/${id}/ai-reply-assist`, { prompt });
    return data;
  },

  compose: async (input: { to: string; subject: string; body: string; body_html?: string; smtp_account_id?: string }) => {
    const { data } = await apiClient.post<{ success: boolean; message_id: string }>('/inbox/compose', input);
    return data;
  },
};
