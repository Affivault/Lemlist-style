import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middleware/error.middleware.js';
import { getPagination, formatPaginatedResponse } from '../utils/pagination.js';

export const campaignContactsService = {
  async list(campaignId: string, params: { page?: number; limit?: number }) {
    const { page, limit, from, to } = getPagination(params);

    const { data, count, error } = await supabaseAdmin
      .from('campaign_contacts')
      .select('*, contacts(email, first_name, last_name)', { count: 'exact' })
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new AppError(error.message, 500);

    const formatted = (data || []).map((cc: any) => ({
      ...cc,
      contact: cc.contacts,
      contacts: undefined,
    }));

    return formatPaginatedResponse(formatted, count || 0, page, limit);
  },

  async add(campaignId: string, contactIds: string[]) {
    const rows = contactIds.map((contactId) => ({
      campaign_id: campaignId,
      contact_id: contactId,
      status: 'pending',
      current_step_order: 0,
    }));

    const { error } = await supabaseAdmin
      .from('campaign_contacts')
      .upsert(rows, { onConflict: 'campaign_id,contact_id' });

    if (error) throw new AppError(error.message, 500);

    // Update campaign total_contacts
    const { count } = await supabaseAdmin
      .from('campaign_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId);

    await supabaseAdmin
      .from('campaigns')
      .update({ total_contacts: count || 0 })
      .eq('id', campaignId);
  },

  async remove(campaignId: string, contactIds: string[]) {
    const { error } = await supabaseAdmin
      .from('campaign_contacts')
      .delete()
      .eq('campaign_id', campaignId)
      .in('contact_id', contactIds);

    if (error) throw new AppError(error.message, 500);

    // Update campaign total_contacts
    const { count } = await supabaseAdmin
      .from('campaign_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId);

    await supabaseAdmin
      .from('campaigns')
      .update({ total_contacts: count || 0 })
      .eq('id', campaignId);
  },
};
