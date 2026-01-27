import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middleware/error.middleware.js';
import { getPagination, formatPaginatedResponse } from '../utils/pagination.js';

export const inboxService = {
  async list(userId: string, params: { page?: number; limit?: number; is_read?: boolean }) {
    const { page, limit, from, to } = getPagination(params);

    let query = supabaseAdmin
      .from('inbox_messages')
      .select('*, contacts(first_name, last_name), campaigns(name)', { count: 'exact' })
      .eq('user_id', userId);

    if (params.is_read !== undefined) {
      query = query.eq('is_read', params.is_read);
    }

    query = query.order('received_at', { ascending: false }).range(from, to);

    const { data, count, error } = await query;
    if (error) throw new AppError(error.message, 500);

    const messages = (data || []).map((m: any) => ({
      ...m,
      contact_name: m.contacts
        ? [m.contacts.first_name, m.contacts.last_name].filter(Boolean).join(' ') || null
        : null,
      campaign_name: m.campaigns?.name || null,
      contacts: undefined,
      campaigns: undefined,
    }));

    return formatPaginatedResponse(messages, count || 0, page, limit);
  },

  async get(userId: string, id: string) {
    const { data, error } = await supabaseAdmin
      .from('inbox_messages')
      .select('*, contacts(first_name, last_name), campaigns(name)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw new AppError(error.message, 500);
    if (!data) throw new AppError('Message not found', 404);

    return {
      ...data,
      contact_name: data.contacts
        ? [data.contacts.first_name, data.contacts.last_name].filter(Boolean).join(' ') || null
        : null,
      campaign_name: data.campaigns?.name || null,
      contacts: undefined,
      campaigns: undefined,
    };
  },

  async markRead(userId: string, id: string) {
    const { error } = await supabaseAdmin
      .from('inbox_messages')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new AppError(error.message, 500);
  },

  async markAllRead(userId: string) {
    const { error } = await supabaseAdmin
      .from('inbox_messages')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw new AppError(error.message, 500);
  },
};
