import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi } from '../../api/campaigns.api';
import { analyticsApi } from '../../api/analytics.api';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { formatDate, formatDateTime, percentage } from '../../lib/utils';
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
  Users,
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
    return <div className="text-center text-gray-500">Campaign not found</div>;
  }

  const chartData = analytics
    ? [
        { name: 'Sent', value: analytics.sent, fill: '#3B82F6' },
        { name: 'Opened', value: analytics.opened, fill: '#10B981' },
        { name: 'Clicked', value: analytics.clicked, fill: '#8B5CF6' },
        { name: 'Replied', value: analytics.replied, fill: '#6366F1' },
        { name: 'Bounced', value: analytics.bounced, fill: '#EF4444' },
      ]
    : [];

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'sequence', label: `Sequence (${campaign.steps?.length || 0})` },
    { id: 'contacts', label: `Contacts (${campaign.contacts_count || 0})` },
  ];

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/campaigns')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Campaigns
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
            <StatusBadge status={campaign.status} type="campaign" />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Created {formatDate(campaign.created_at)}
            {campaign.started_at && ` · Started ${formatDate(campaign.started_at)}`}
            {campaign.completed_at && ` · Completed ${formatDate(campaign.completed_at)}`}
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
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
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
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                <StatCard icon={Send} label="Sent" value={analytics.sent} color="text-blue-500" />
                <StatCard icon={Mail} label="Opened" value={analytics.opened} rate={analytics.open_rate} color="text-green-500" />
                <StatCard icon={MousePointerClick} label="Clicked" value={analytics.clicked} rate={analytics.click_rate} color="text-purple-500" />
                <StatCard icon={MessageSquare} label="Replied" value={analytics.replied} rate={analytics.reply_rate} color="text-indigo-500" />
                <StatCard icon={AlertTriangle} label="Bounced" value={analytics.bounced} rate={analytics.bounce_rate} color="text-red-500" />
              </div>

              {chartData.some((d) => d.value > 0) && (
                <div className="card p-5">
                  <h3 className="mb-4 font-semibold text-gray-900">Performance</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <rect key={index} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Campaign settings */}
          <div className="card p-5">
            <h3 className="mb-3 font-semibold text-gray-900">Campaign Settings</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Timezone</dt>
                <dd className="font-medium text-gray-900">{campaign.timezone}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Send Window</dt>
                <dd className="font-medium text-gray-900">
                  {campaign.send_window_start || '—'} – {campaign.send_window_end || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Send Days</dt>
                <dd className="font-medium capitalize text-gray-900">
                  {campaign.send_days?.join(', ') || 'Weekdays'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Total Contacts</dt>
                <dd className="font-medium text-gray-900">{campaign.total_contacts}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Sequence Tab */}
      {activeTab === 'sequence' && (
        <div className="space-y-3">
          {(!campaign.steps || campaign.steps.length === 0) ? (
            <p className="py-8 text-center text-sm text-gray-400">No steps in this campaign.</p>
          ) : (
            campaign.steps.map((step: CampaignStep, index: number) => (
              <div key={step.id} className="card p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                    {index + 1}
                  </span>
                  {step.step_type === 'email' ? (
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary-500" />
                        <span className="font-medium text-gray-900">{step.subject || 'Untitled Email'}</span>
                      </div>
                      {step.body_text && (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">{step.body_text}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="font-medium text-gray-900">
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
            <p className="py-8 text-center text-sm text-gray-400">No contacts in this campaign.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-gray-500">
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Current Step</th>
                    <th className="px-4 py-3">Next Send</th>
                    <th className="px-4 py-3">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignContacts.data.map((cc: any) => (
                    <tr key={cc.id} className="border-b border-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">
                          {[cc.contact?.first_name, cc.contact?.last_name].filter(Boolean).join(' ') || cc.contact?.email || '—'}
                        </span>
                        {cc.contact?.email && (
                          <span className="ml-2 text-gray-400">{cc.contact.email}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={cc.status} type="contact" />
                      </td>
                      <td className="px-4 py-3 text-gray-600">Step {cc.current_step_order + 1}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {cc.next_send_at ? formatDateTime(cc.next_send_at) : '—'}
                      </td>
                      <td className="px-4 py-3 text-red-500">{cc.error_message || '—'}</td>
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

function StatCard({ icon: Icon, label, value, rate, color }: {
  icon: React.ElementType;
  label: string;
  value: number;
  rate?: number;
  color: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      {rate !== undefined && <p className="text-xs text-gray-400">{rate}%</p>}
    </div>
  );
}
