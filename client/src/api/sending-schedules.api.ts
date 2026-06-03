import { apiClient } from './client';

export interface SendingSchedule {
  id: string;
  name: string;
  timezone: string;
  send_window_start: string;
  send_window_end: string;
  send_days: string[];
  is_default: boolean;
  created_at: string;
}

export interface SendingScheduleInput {
  name: string;
  timezone?: string;
  send_window_start?: string;
  send_window_end?: string;
  send_days?: string[];
  is_default?: boolean;
}

export const sendingSchedulesApi = {
  list: async () => {
    const { data } = await apiClient.get<SendingSchedule[]>('/sending-schedules');
    return data;
  },
  getDefault: async () => {
    const { data } = await apiClient.get<SendingSchedule | null>('/sending-schedules/default');
    return data;
  },
  create: async (input: SendingScheduleInput) => {
    const { data } = await apiClient.post<SendingSchedule>('/sending-schedules', input);
    return data;
  },
  update: async (id: string, input: Partial<SendingScheduleInput>) => {
    const { data } = await apiClient.patch<SendingSchedule>(`/sending-schedules/${id}`, input);
    return data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/sending-schedules/${id}`);
  },
};
