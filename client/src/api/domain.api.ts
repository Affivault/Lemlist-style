import { apiClient } from './client';
import type { SendingDomain, DomainVerifyResponse } from '@lemlist/shared';

export const domainApi = {
  list: async () => {
    const { data } = await apiClient.get<SendingDomain[]>('/domains');
    return data;
  },

  get: async (id: string) => {
    const { data } = await apiClient.get<SendingDomain>(`/domains/${id}`);
    return data;
  },

  create: async (domain: string) => {
    const { data } = await apiClient.post<DomainVerifyResponse>('/domains', { domain });
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/domains/${id}`);
  },

  verify: async (id: string) => {
    const { data } = await apiClient.post<DomainVerifyResponse>(`/domains/${id}/verify`);
    return data;
  },

  getRecords: async (id: string) => {
    const { data } = await apiClient.get<DomainVerifyResponse>(`/domains/${id}/records`);
    return data;
  },
};
