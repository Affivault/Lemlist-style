import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi } from '../../api/campaigns.api';
import { analyticsApi } from '../../api/analytics.api';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { formatDate, formatDateTime } from '../../lib/utils';
import {
  ArrowLeft,
  Play,
  Pause,
  Square,
  Pencil,
  Trash2,
  Send,
  Mail,
  MousePointerClick,
  MessageSquare,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';
import type { CampaignStep } from '@lemlist/shared';

type TabId = 'overview' | 'sequence' | 'contacts';

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => campaignsApi.get(id!),
    enabled: !!id,
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics', 'campaign', id],
    queryFn: () => analyticsApi.campaign(id!),
    enabled: !!id,
  });

  const { data: campaignContacts } = useQuery({
    queryKey: ['campaign-contacts', id],
    queryFn: () => campaignsApi.getContacts(id!, { limit: 100 }),
    enabled: !!id && activeTab === 'contacts',
  });

  const launchMutation = useMutation({
    mutationFn: () => campaignsApi.launch(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign launched');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to launch'),
  });

  const pauseMutation = useMutation({
    mutationFn: () => campaignsApi.pause(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign paused');
    },
  });

  const resumeMutation = useMutation({
    mutationFn: () => campaignsApi.resume(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign resumed');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => campaignsApi.cancel(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign cancelled');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => campaignsApi.delete(id!),
    onSuccess: () => {
      toast.success('Campaign deleted');
      navigate('/campaigns');
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!campaign) {
    return <div className="text-center text-secondary">Campaign not found</div>;
  }

  const chartData = analytics
    ? [
        { name: 'Sent', value: analytics.sent, fill: '#10b981' },
        { name: 'Opened', value: analytics.opened, fill: '#10b981' },
        { name: 'Clicked', value: analytics.clicked, fill: '#10b981' },
        { name: 'Replied', value: analytics.replied, fill: '#10b981' },
        { name: 'Bounced', value: analytics.bounced, fill: '#ef4444' },
      ]
    : [];

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'sequence', label: `Sequence (${campaign.steps?.length || 0})` },
    { id: 'contacts', label: `Contacts (${campaign.contacts_count || 0})` },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <button
        onClick={() => navigate('/campaigns')}
        className="flex items-center gap-1 text-sm text-secondary hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Campaigns
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-primary">{campaign.name}</h1>
            <StatusBadge status={campaign.status} type="campaign" />
          </div>
          <p className="mt-1 text-sm text-secondary">
            Created {formatDate(campaign.created_at)}
            {campaign.started_at && ` · Started ${formatDate(campaign.started_at)}`}
          </p>
        </div>
        <div className="flex gap-2">
          {campaign.status === 'draft' && (
            <>
              <Button variant="secondary" onClick={() => navigate(`/campaigns/${id}/edit`)}>
                <Pencil className="h-4 w-4" /> Edit
              </Button>
              <Button onClick={() => launchMutation.mutate()}>
                <Play className="h-4 w-4" /> Launch
              </Button>
            </>
          )}
          {campaign.status === 'running' && (
            <>
              <Button variant="secondary" onClick={() => pauseMutation.mutate()}>
                <Pause className="h-4 w-4" /> Pause
              </Button>
              <Button variant="danger" onClick={() => cancelMutation.mutate()}>
                <Square className="h-4 w-4" /> Cancel
              </Button>
            </>
          )}
          {campaign.status === 'paused' && (
            <>
              <Button onClick={() => resumeMutation.mutate()}>
                <Play className="h-4 w-4" /> Resume
              </Button>
              <Button variant="danger" onClick={() => cancelMutation.mutate()}>
                <Square className="h-4 w-4" /> Cancel
              </Button>
            </>
          )}
          {(campaign.status === 'draft' || campaign.status === 'completed' || campaign.status === 'cancelled') && (
            <Button
              variant="danger"
              onClick={() => {
                if (confirm('Delete this campaign permanently?')) deleteMutation.mutate();
              }}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-subtle">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors -mb-px ${
              activeTab === tab.id
                ? 'border-brand text-primary'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {analytics && (
            <>
              <div className="grid grid-cols-5 gap-4">
                <StatCard icon={Send} label="Sent" value={analytics.sent} />
                <StatCard icon={Mail} label="Opened" value={analytics.opened} rate={analytics.open_rate} />
                <StatCard icon={MousePointerClick} label="Clicked" value={analytics.clicked} rate={analytics.click_rate} />
                <StatCard icon={MessageSquare} label="Replied" value={analytics.replied} rate={analytics.reply_rate} />
                <StatCard icon={AlertTriangle} label="Bounced" value={analytics.bounced} rate={analytics.bounce_rate} isNegative />
              </div>

              {chartData.some((d) => d.value > 0) && (
                <div className="rounded-lg border border-subtle bg-surface p-5">
                  <h3 className="mb-4 text-sm font-medium text-primary">Performance</h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="name" tick={{ fill: '#a1a1a1', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} />
                        <YAxis tick={{ fill: '#a1a1a1', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#111113', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff' }}
                          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="rounded-lg border border-subtle bg-surface p-5">
            <h3 className="mb-4 text-sm font-medium text-primary">Campaign Settings</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-tertiary">Timezone</dt>
                <dd className="font-medium text-primary">{campaign.timezone}</dd>
              </div>
              <div>
                <dt className="text-tertiary">Send Window</dt>
                <dd className="font-medium text-primary">
                  {campaign.send_window_start || '—'} – {campaign.send_window_end || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-tertiary">Send Days</dt>
                <dd className="font-medium capitalize text-primary">
                  {campaign.send_days?.join(', ') || 'Weekdays'}
                </dd>
              </div>
              <div>
                <dt className="text-tertiary">Total Contacts</dt>
                <dd className="font-medium text-primary">{campaign.total_contacts}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Sequence Tab */}
      {activeTab === 'sequence' && (
        <div className="space-y-3">
          {(!campaign.steps || campaign.steps.length === 0) ? (
            <p className="py-8 text-center text-sm text-tertiary">No steps in this campaign.</p>
          ) : (
            campaign.steps.map((step: CampaignStep, index: number) => (
              <div key={step.id} className="rounded-lg border border-subtle bg-surface p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-elevated text-xs font-medium text-secondary">
                    {index + 1}
                  </span>
                  {step.step_type === 'email' ? (
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-brand" />
                        <span className="font-medium text-primary">{step.subject || 'Untitled Email'}</span>
                      </div>
                      {step.body_text && (
                        <p className="mt-1 line-clamp-2 text-sm text-secondary">{step.body_text}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-500" />
                      <span className="font-medium text-primary">
                        Wait {step.delay_days}d {step.delay_hours}h {step.delay_minutes}m
                      </span>
                    </div>
                  )}
                  {step.skip_if_replied && (
                    <Badge variant="info">Skip if replied</Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Contacts Tab */}
      {activeTab === 'contacts' && (
        <div>
          {!campaignContacts?.data?.length ? (
            <p className="py-8 text-center text-sm text-tertiary">No contacts in this campaign.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-subtle bg-surface">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-subtle text-left text-tertiary">
                    <th className="px-4 py-3 font-medium">Contact</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Current Step</th>
                    <th className="px-4 py-3 font-medium">Next Send</th>
                    <th className="px-4 py-3 font-medium">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignContacts.data.map((cc: any) => (
                    <tr key={cc.id} className="border-b border-subtle last:border-0 hover:bg-hover">
                      <td className="px-4 py-3">
                        <span className="font-medium text-primary">
                          {[cc.contact?.first_name, cc.contact?.last_name].filter(Boolean).join(' ') || cc.contact?.email || '—'}
                        </span>
                        {cc.contact?.email && (
                          <span className="ml-2 text-tertiary">{cc.contact.email}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={cc.status} type="contact" />
                      </td>
                      <td className="px-4 py-3 text-secondary">Step {cc.current_step_order + 1}</td>
                      <td className="px-4 py-3 text-secondary">
                        {cc.next_send_at ? formatDateTime(cc.next_send_at) : '—'}
                      </td>
                      <td className="px-4 py-3 text-red-400">{cc.error_message || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, rate, isNegative }: {
  icon: React.ElementType;
  label: string;
  value: number;
  rate?: number;
  isNegative?: boolean;
}) {
  return (
    <div className="rounded-lg border border-subtle bg-surface p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${isNegative ? 'text-red-400' : 'text-secondary'}`} />
        <span className="text-sm text-secondary">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-primary">{value}</p>
      {rate !== undefined && <p className="text-xs text-tertiary mt-1">{rate}%</p>}
    </div>
  );
}
