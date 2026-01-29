import { apiClient } from './client';
import type { SaraClassificationResult, SaraQueueStats } from '@lemlist/shared';

export const saraApi = {
  getQueue: async (params?: { intent?: string; status?: string; limit?: number; offset?: number }) => {
    const { data } = await apiClient.get<{ messages: any[]; total: number }>('/sara/queue', { params });
    return data;
  },

  getStats: async () => {
    const { data } = await apiClient.get<SaraQueueStats>('/sara/stats');
    return data;
  },

  classify: async (messageId: string) => {
    const { data } = await apiClient.post<SaraClassificationResult>(`/sara/classify/${messageId}`);
    return data;
  },

  approve: async (messageId: string, editedReply?: string) => {
    await apiClient.post(`/sara/approve/${messageId}`, { edited_reply: editedReply });
  },

  dismiss: async (messageId: string) => {
    await apiClient.post(`/sara/dismiss/${messageId}`);
  },
};
