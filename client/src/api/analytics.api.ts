import { apiClient } from './client';
import type { CampaignAnalytics, OverviewAnalytics, ContactActivityItem } from '@lemlist/shared';

export const analyticsApi = {
  overview: async () => {
    const { data } = await apiClient.get<OverviewAnalytics>('/analytics/overview');
    return data;
  },

  campaign: async (campaignId: string) => {
    const { data } = await apiClient.get<CampaignAnalytics>(`/analytics/campaigns/${campaignId}`);
    return data;
  },

  campaignContacts: async (campaignId: string) => {
    const { data } = await apiClient.get<{ contacts: Array<{
      contact_id: string;
      email: string;
      first_name: string | null;
      last_name: string | null;
      status: string;
      sent: number;
      opened: number;
      clicked: number;
      replied: boolean;
    }> }>(`/analytics/campaigns/${campaignId}/contacts`);
    return data;
  },

  contactTimeline: async (contactId: string) => {
    const { data } = await apiClient.get<ContactActivityItem[]>(`/analytics/contacts/${contactId}/timeline`);
    return data;
  },
};
