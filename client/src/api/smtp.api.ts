import { apiClient } from './client';
import type { SmtpAccount, CreateSmtpAccountInput, UpdateSmtpAccountInput } from '@lemlist/shared';

export const smtpApi = {
  list: async () => {
    const { data } = await apiClient.get<SmtpAccount[]>('/smtp-accounts');
    return data;
  },

  get: async (id: string) => {
    const { data } = await apiClient.get<SmtpAccount>(`/smtp-accounts/${id}`);
    return data;
  },

  create: async (input: CreateSmtpAccountInput) => {
    const { data } = await apiClient.post<SmtpAccount>('/smtp-accounts', input);
    return data;
  },

  update: async (id: string, input: UpdateSmtpAccountInput) => {
    const { data } = await apiClient.put<SmtpAccount>(`/smtp-accounts/${id}`, input);
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/smtp-accounts/${id}`);
  },

  test: async (id: string) => {
    const { data } = await apiClient.post<{ success: boolean; message: string }>(`/smtp-accounts/${id}/test`);
    return data;
  },

  sendTestEmail: async (smtpAccountId: string, input: { to: string; subject: string; body_html?: string }) => {
    const { data } = await apiClient.post<{ success: boolean; message?: string; error?: string }>(`/smtp-accounts/${smtpAccountId}/send-test`, input);
    return data;
  },
};
