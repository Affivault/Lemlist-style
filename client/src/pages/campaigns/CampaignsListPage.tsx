import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { campaignsApi } from '../../api/campaigns.api';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/shared/EmptyState';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { formatDate, cn } from '../../lib/utils';
import { Megaphone, Plus, Send, Mail, MousePointerClick, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import type { CampaignWithStats } from '@lemlist/shared';
import { DEFAULT_PAGE_SIZE } from '../../lib/constants';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Running', value: 'running' },
  { label: 'Paused', value: 'paused' },
  { label: 'Completed', value: 'completed' },
];

export function CampaignsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', page, statusFilter],
    queryFn: () =>
      campaignsApi.list({
        page,
        limit: DEFAULT_PAGE_SIZE,
        status: statusFilter || undefined,
      }),
  });

  const launchMutation = useMutation({
    mutationFn: campaignsApi.launch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign launched');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to launch'),
  });

  const pauseMutation = useMutation({
    mutationFn: campaignsApi.pause,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign paused');
    },
  });

  const resumeMutation = useMutation({
    mutationFn: campaignsApi.resume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign resumed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: campaignsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign deleted');
    },
  });

  const campaigns = data?.data || [];
  const totalPages = data?.total_pages || 1;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Campaigns</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Manage your email outreach campaigns</p>
        </div>
        <Button onClick={() => navigate('/campaigns/new')}>
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 border-b border-[var(--border-subtle)]">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              statusFilter === tab.value
                ? 'border-[var(--text-primary)] text-[var(--text-primary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No campaigns"
          description="Create your first email campaign to start reaching out."
          actionLabel="New Campaign"
          onAction={() => navigate('/campaigns/new')}
        />
      ) : (
        <>
          <div className="space-y-2">
            {campaigns.map((campaign: CampaignWithStats) => (
              <div
                key={campaign.id}
                className="cursor-pointer rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 transition-colors hover:bg-[var(--bg-hover)]"
                onClick={() => navigate(`/campaigns/${campaign.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-[var(--text-primary)]">{campaign.name}</h3>
                      <StatusBadge status={campaign.status} type="campaign" />
                    </div>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {campaign.steps_count} steps · {campaign.contacts_count} contacts · Created {formatDate(campaign.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {campaign.status === 'draft' && (
                      <>
                        <Button size="sm" onClick={() => launchMutation.mutate(campaign.id)}>
                          Launch
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}
                        >
                          Edit
                        </Button>
                      </>
                    )}
                    {campaign.status === 'running' && (
                      <Button variant="secondary" size="sm" onClick={() => pauseMutation.mutate(campaign.id)}>
                        Pause
                      </Button>
                    )}
                    {campaign.status === 'paused' && (
                      <Button size="sm" onClick={() => resumeMutation.mutate(campaign.id)}>
                        Resume
                      </Button>
                    )}
                    {(campaign.status === 'draft' || campaign.status === 'completed' || campaign.status === 'cancelled') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Delete this campaign?')) deleteMutation.mutate(campaign.id);
                        }}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                {(campaign.sent_count > 0 || campaign.status !== 'draft') && (
                  <div className="mt-4 flex gap-6 text-sm text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1.5"><Send className="h-3.5 w-3.5 text-[var(--text-tertiary)]" /> {campaign.sent_count} sent</span>
                    <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-[var(--text-tertiary)]" /> {campaign.opened_count} opened</span>
                    <span className="flex items-center gap-1.5"><MousePointerClick className="h-3.5 w-3.5 text-[var(--text-tertiary)]" /> {campaign.clicked_count} clicked</span>
                    <span className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5 text-[var(--text-tertiary)]" /> {campaign.replied_count} replied</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-[var(--text-secondary)]">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
