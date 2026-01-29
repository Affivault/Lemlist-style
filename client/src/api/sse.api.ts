import { apiClient } from './client';
import type { SmtpAccountHealthSummary, SseSelectionResult } from '@lemlist/shared';

export const sseApi = {
  dashboard: async () => {
    const { data } = await apiClient.get<SmtpAccountHealthSummary[]>('/sse/dashboard');
    return data;
  },

  selectSender: async (campaignId: string) => {
    const { data } = await apiClient.get<SseSelectionResult>(`/sse/campaigns/${campaignId}/select`);
    return data;
  },

  getCampaignPool: async (campaignId: string) => {
    const { data } = await apiClient.get<{ account_ids: string[] }>(`/sse/campaigns/${campaignId}/pool`);
    return data;
  },

  setCampaignPool: async (campaignId: string, accountIds: string[]) => {
    await apiClient.put(`/sse/campaigns/${campaignId}/pool`, { account_ids: accountIds });
  },
};
