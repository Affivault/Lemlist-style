import { apiClient } from './client';
import type { AssetTemplate, CreateAssetTemplateInput, UpdateAssetTemplateInput } from '@lemlist/shared';

export const assetApi = {
  listTemplates: async () => {
    const { data } = await apiClient.get<AssetTemplate[]>('/assets/templates');
    return data;
  },

  getTemplate: async (id: string) => {
    const { data } = await apiClient.get<AssetTemplate>(`/assets/templates/${id}`);
    return data;
  },

  createTemplate: async (input: CreateAssetTemplateInput) => {
    const { data } = await apiClient.post<AssetTemplate>('/assets/templates', input);
    return data;
  },

  updateTemplate: async (id: string, input: UpdateAssetTemplateInput) => {
    const { data } = await apiClient.put<AssetTemplate>(`/assets/templates/${id}`, input);
    return data;
  },

  deleteTemplate: async (id: string) => {
    await apiClient.delete(`/assets/templates/${id}`);
  },

  getPresets: async () => {
    const { data } = await apiClient.get<CreateAssetTemplateInput[]>('/assets/templates/presets');
    return data;
  },
};
