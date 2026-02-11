import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middleware/error.middleware.js';
import { getPagination, formatPaginatedResponse } from '../utils/pagination.js';
import { fireEvent } from './webhook.service.js';
import { processDueSteps } from './sequence.service.js';

interface ListParams {
  page?: number;
  limit?: number;
  status?: string;
}

export const campaignsService = {
  async list(userId: string, params: ListParams) {
    const { page, limit, from, to } = getPagination(params);

    let query = supabaseAdmin
      .from('campaigns')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (params.status) {
      query = query.eq('status', params.status);
    }

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data: campaigns, count, error } = await query;
    if (error) throw new AppError(error.message, 500);

    // Compute stats for each campaign
    const withStats = await Promise.all(
      (campaigns || []).map(async (campaign: any) => {
        const stats = await this.getStats(campaign.id);
        return { ...campaign, ...stats };
      })
    );

    return formatPaginatedResponse(withStats, count || 0, page, limit);
  },

  async get(userId: string, id: string) {
    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw new AppError(error.message, 500);
    if (!data) throw new AppError('Campaign not found', 404);

    const { data: steps } = await supabaseAdmin
      .from('campaign_steps')
      .select('*')
      .eq('campaign_id', id)
      .order('step_order');

    const stats = await this.getStats(id);

    return { ...data, ...stats, steps: steps || [] };
  },

  async create(userId: string, input: any) {
    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .insert({ ...input, user_id: userId, status: 'draft' })
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    fireEvent(userId, 'campaign.created', { campaign: data }).catch(() => {});
    return data;
  },

  async update(userId: string, id: string, input: any) {
    const existing = await this.get(userId, id);
    if (existing.status !== 'draft') {
      throw new AppError('Can only edit campaigns in draft status', 400);
    }

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .update(input)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    fireEvent(userId, 'campaign.updated', { campaign: data }).catch(() => {});
    return data;
  },

  async delete(userId: string, id: string) {
    const { error } = await supabaseAdmin
      .from('campaigns')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new AppError(error.message, 500);
    fireEvent(userId, 'campaign.deleted', { campaign_id: id }).catch(() => {});
  },

  async launch(userId: string, id: string) {
    const campaign = await this.get(userId, id);
    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      throw new AppError('Campaign must be in draft or scheduled status to launch', 400);
    }

    // Count contacts
    const { count } = await supabaseAdmin
      .from('campaign_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', id);

    if (!count || count === 0) {
      throw new AppError('Campaign must have at least one contact', 400);
    }

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
        total_contacts: count,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    // Set all pending contacts to active
    await supabaseAdmin
      .from('campaign_contacts')
      .update({ status: 'active', next_send_at: new Date().toISOString() })
      .eq('campaign_id', id)
      .eq('status', 'pending');

    fireEvent(userId, 'campaign.launched', { campaign: data }).catch(() => {});

    // Immediately start processing — don't wait for the 30-second sequence worker tick
    console.log(`[Campaign] Launched campaign ${id} — triggering immediate processing`);
    processDueSteps().catch((err) => {
      console.error('[Campaign] Immediate processing error:', err.message);
    });

    return data;
  },

  async pause(userId: string, id: string) {
    const campaign = await this.get(userId, id);
    if (campaign.status !== 'running') {
      throw new AppError('Campaign must be running to pause', 400);
    }

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .update({ status: 'paused' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    fireEvent(userId, 'campaign.paused', { campaign: data }).catch(() => {});
    return data;
  },

  async resume(userId: string, id: string) {
    const campaign = await this.get(userId, id);
    if (campaign.status !== 'paused') {
      throw new AppError('Campaign must be paused to resume', 400);
    }

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .update({ status: 'running' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    fireEvent(userId, 'campaign.resumed', { campaign: data }).catch(() => {});
    return data;
  },

  async cancel(userId: string, id: string) {
    const campaign = await this.get(userId, id);
    if (campaign.status !== 'running' && campaign.status !== 'paused') {
      throw new AppError('Campaign must be running or paused to cancel', 400);
    }

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .update({ status: 'cancelled', completed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    fireEvent(userId, 'campaign.cancelled', { campaign: data }).catch(() => {});
    return data;
  },

  async getStats(campaignId: string) {
    const { count: stepsCount } = await supabaseAdmin
      .from('campaign_steps')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId);

    const { count: contactsCount } = await supabaseAdmin
      .from('campaign_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId);

    const { data: activities } = await supabaseAdmin
      .from('campaign_activities')
      .select('activity_type')
      .eq('campaign_id', campaignId);

    const counts = { sent: 0, opened: 0, clicked: 0, replied: 0, bounced: 0 };
    for (const a of activities || []) {
      if (a.activity_type in counts) {
        counts[a.activity_type as keyof typeof counts]++;
      }
    }

    return {
      steps_count: stepsCount || 0,
      contacts_count: contactsCount || 0,
      sent_count: counts.sent,
      opened_count: counts.opened,
      clicked_count: counts.clicked,
      replied_count: counts.replied,
      bounced_count: counts.bounced,
    };
  },
};
