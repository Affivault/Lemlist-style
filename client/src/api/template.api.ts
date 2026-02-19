import { apiClient } from './client';
import type {
  EmailTemplate,
  SequenceTemplate,
  CreateEmailTemplateInput,
  UpdateEmailTemplateInput,
  CreateSequenceTemplateInput,
  UpdateSequenceTemplateInput,
} from '@lemlist/shared';

export const templateApi = {
  // Email templates
  listEmails: async () => {
    const { data } = await apiClient.get<EmailTemplate[]>('/templates/emails');
    return data;
  },
  getEmail: async (id: string) => {
    const { data } = await apiClient.get<EmailTemplate>(`/templates/emails/${id}`);
    return data;
  },
  createEmail: async (input: CreateEmailTemplateInput) => {
    const { data } = await apiClient.post<EmailTemplate>('/templates/emails', input);
    return data;
  },
  updateEmail: async (id: string, input: UpdateEmailTemplateInput) => {
    const { data } = await apiClient.put<EmailTemplate>(`/templates/emails/${id}`, input);
    return data;
  },
  deleteEmail: async (id: string) => {
    await apiClient.delete(`/templates/emails/${id}`);
  },
  duplicateEmail: async (id: string) => {
    const { data } = await apiClient.post<EmailTemplate>(`/templates/emails/${id}/duplicate`);
    return data;
  },

  // Sequence templates
  listSequences: async () => {
    const { data } = await apiClient.get<SequenceTemplate[]>('/templates/sequences');
    return data;
  },
  getSequence: async (id: string) => {
    const { data } = await apiClient.get<SequenceTemplate>(`/templates/sequences/${id}`);
    return data;
  },
  createSequence: async (input: CreateSequenceTemplateInput) => {
    const { data } = await apiClient.post<SequenceTemplate>('/templates/sequences', input);
    return data;
  },
  updateSequence: async (id: string, input: UpdateSequenceTemplateInput) => {
    const { data } = await apiClient.put<SequenceTemplate>(`/templates/sequences/${id}`, input);
    return data;
  },
  deleteSequence: async (id: string) => {
    await apiClient.delete(`/templates/sequences/${id}`);
  },
  duplicateSequence: async (id: string) => {
    const { data } = await apiClient.post<SequenceTemplate>(`/templates/sequences/${id}/duplicate`);
    return data;
  },

  // Presets
  getPresets: async () => {
    const { data } = await apiClient.get<{
      emails: Omit<EmailTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>[];
      sequences: Omit<SequenceTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>[];
    }>('/templates/presets');
    return data;
  },
};
