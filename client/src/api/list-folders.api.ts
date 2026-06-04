import { apiClient } from './client';

export interface ListFolder {
  id: string;
  name: string;
  color: string;
  icon: string;
  position: number;
  list_count: number;
  created_at: string;
}

export const listFoldersApi = {
  list: async () => {
    const { data } = await apiClient.get<ListFolder[]>('/list-folders');
    return data;
  },
  create: async (input: { name: string; color?: string; icon?: string }) => {
    const { data } = await apiClient.post<ListFolder>('/list-folders', input);
    return data;
  },
  update: async (id: string, input: Partial<{ name: string; color: string; icon: string; position: number }>) => {
    const { data } = await apiClient.patch<ListFolder>(`/list-folders/${id}`, input);
    return data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/list-folders/${id}`);
  },
  moveList: async (listId: string, folderId: string | null) => {
    await apiClient.post('/list-folders/move', { list_id: listId, folder_id: folderId });
  },
  trashList: async (listId: string) => {
    await apiClient.post(`/list-folders/${listId}/trash`);
  },
  restoreList: async (listId: string) => {
    await apiClient.post(`/list-folders/${listId}/restore`);
  },
  listTrashed: async () => {
    const { data } = await apiClient.get<any[]>('/list-folders/trash');
    return data;
  },
};
