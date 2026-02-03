import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analytics.api';
import { campaignsApi } from '../../api/campaigns.api';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import {
  Send,
  Mail,
  MousePointerClick,
  MessageSquare,
  AlertTriangle,
  Calendar,
  Target,
  Users,
  TrendingUp,
  TrendingDown,
  ChevronDown,
} from 'lucide-react';

const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b'];

const tooltipStyle = {
  backgroundColor: '#111113',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '6px',
};

function StatCard({
  icon: Icon,
  label,
  value,
  rate,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  rate?: number;
  trend?: number;
}) {
  return (
    <div className="rounded-lg border border-subtle bg-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <Icon className="h-5 w-5 text-secondary" />
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-brand' : 'text-red-400'}`}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-semibold text-white">{value.toLocaleString()}</p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-sm text-secondary">{label}</p>
        {rate !== undefined && (
          <p className="text-sm text-tertiary">{rate.toFixed(1)}%</p>
        )}
      </div>
    </div>
  );
}

function EngagementRing({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <div className="rounded-lg border border-subtle bg-surface p-5">
      <h3 className="text-sm font-medium text-white mb-4">Engagement Breakdown</h3>
      <div className="flex items-center gap-6">
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [value.toLocaleString(), 'Count']}
                contentStyle={tooltipStyle}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-secondary">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{item.value.toLocaleString()}</span>
                <span className="text-xs text-tertiary">
                  ({total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AnalyticsDashboardPage() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: analyticsApi.overview,
  });

  const { data: campaignsData } = useQuery({
    queryKey: ['campaigns', 'list'],
    queryFn: () => campaignsApi.list({ limit: 100 }),
  });

  const { data: campaignAnalytics } = useQuery({
    queryKey: ['analytics', 'campaign', selectedCampaignId],
    queryFn: () => analyticsApi.campaign(selectedCampaignId),
    enabled: !!selectedCampaignId,
  });

  const { data: campaignContacts } = useQuery({
    queryKey: ['analytics', 'campaign-contacts', selectedCampaignId],
    queryFn: () => analyticsApi.campaignContacts(selectedCampaignId),
    enabled: !!selectedCampaignId,
  });

  if (overviewLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const campaigns = campaignsData?.data || [];

  const chartData = campaignAnalytics
    ? [
        { name: 'Sent', value: campaignAnalytics.sent, fill: '#10b981' },
        { name: 'Opened', value: campaignAnalytics.opened, fill: '#10b981' },
        { name: 'Clicked', value: campaignAnalytics.clicked, fill: '#10b981' },
        { name: 'Replied', value: campaignAnalytics.replied, fill: '#10b981' },
        { name: 'Bounced', value: campaignAnalytics.bounced, fill: '#ef4444' },
      ]
    : [];

  const trendData = [
    { day: 'Mon', sent: 45, opened: 32, clicked: 12 },
    { day: 'Tue', sent: 52, opened: 38, clicked: 18 },
    { day: 'Wed', sent: 61, opened: 45, clicked: 22 },
    { day: 'Thu', sent: 48, opened: 35, clicked: 15 },
    { day: 'Fri', sent: 55, opened: 42, clicked: 20 },
    { day: 'Sat', sent: 23, opened: 15, clicked: 8 },
    { day: 'Sun', sent: 18, opened: 12, clicked: 5 },
  ];

  const pieData = overview
    ? [
        { name: 'Opened', value: overview.total_opened },
        { name: 'Clicked', value: overview.total_clicked },
        { name: 'Replied', value: overview.total_replied },
        { name: 'Bounced', value: overview.total_sent - overview.total_opened - overview.total_clicked - overview.total_replied > 0
            ? Math.max(0, overview.total_sent - overview.total_opened)
            : 0 },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Analytics</h1>
          <p className="text-sm text-secondary mt-1">Track your email campaign performance</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-subtle bg-surface">
          <Calendar className="h-4 w-4 text-secondary" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
            className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-5 gap-4">
          <StatCard icon={Send} label="Total Sent" value={overview.total_sent} trend={12} />
          <StatCard icon={Mail} label="Opened" value={overview.total_opened} rate={overview.avg_open_rate} trend={8} />
          <StatCard icon={MousePointerClick} label="Clicked" value={overview.total_clicked} rate={overview.avg_click_rate} trend={-3} />
          <StatCard icon={MessageSquare} label="Replied" value={overview.total_replied} rate={overview.avg_reply_rate} trend={15} />
          <StatCard icon={Target} label="Campaigns" value={overview.total_campaigns} />
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Trend chart */}
        <div className="col-span-2 rounded-lg border border-subtle bg-surface p-5">
          <h3 className="text-sm font-medium text-white mb-4">Weekly Performance</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#a1a1a1', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1a1', fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#fff' }} labelStyle={{ color: '#fff' }} />
                <Area type="monotone" dataKey="sent" stroke="#10b981" strokeWidth={2} fill="url(#colorSent)" name="Sent" />
                <Area type="monotone" dataKey="opened" stroke="#06b6d4" strokeWidth={2} fill="url(#colorOpened)" name="Opened" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement ring */}
        {pieData.length > 0 && <EngagementRing data={pieData} />}
      </div>

      {/* Campaign Deep Dive */}
      <div className="rounded-lg border border-subtle bg-surface">
        <div className="p-5 border-b border-subtle">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-medium text-white">Campaign Deep Dive</h2>
              <p className="text-sm text-secondary mt-0.5">Select a campaign to view detailed analytics</p>
            </div>
            <div className="relative">
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-md border border-default bg-surface text-sm text-white focus:outline-none focus:border-brand min-w-[180px]"
              >
                <option value="">Choose a campaign...</option>
                {campaigns.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tertiary pointer-events-none" />
            </div>
          </div>
        </div>

        {campaignAnalytics ? (
          <div className="p-5 space-y-5">
            {/* Campaign stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 rounded-md bg-brand/10 border border-brand/20">
                <div className="flex items-center gap-2 text-brand mb-2">
                  <Send className="h-4 w-4" />
                  <span className="text-sm font-medium">Sent</span>
                </div>
                <p className="text-2xl font-semibold text-white">{campaignAnalytics.sent}</p>
              </div>
              <div className="p-4 rounded-md bg-brand/10 border border-brand/20">
                <div className="flex items-center gap-2 text-brand mb-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm font-medium">Opened</span>
                </div>
                <p className="text-2xl font-semibold text-white">{campaignAnalytics.opened}</p>
                <p className="text-xs text-tertiary mt-1">{campaignAnalytics.open_rate?.toFixed(1)}% rate</p>
              </div>
              <div className="p-4 rounded-md bg-brand/10 border border-brand/20">
                <div className="flex items-center gap-2 text-brand mb-2">
                  <MousePointerClick className="h-4 w-4" />
                  <span className="text-sm font-medium">Clicked</span>
                </div>
                <p className="text-2xl font-semibold text-white">{campaignAnalytics.clicked}</p>
                <p className="text-xs text-tertiary mt-1">{campaignAnalytics.click_rate?.toFixed(1)}% rate</p>
              </div>
              <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2 text-red-400 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Bounced</span>
                </div>
                <p className="text-2xl font-semibold text-white">{campaignAnalytics.bounced}</p>
                <p className="text-xs text-tertiary mt-1">{campaignAnalytics.bounce_rate?.toFixed(1)}% rate</p>
              </div>
            </div>

            {/* Bar chart */}
            {chartData.length > 0 && (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1a1', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1a1', fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#fff' }} labelStyle={{ color: '#fff' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ) : (
          <div className="p-10 text-center">
            <div className="mx-auto w-12 h-12 rounded-md bg-elevated flex items-center justify-center mb-3">
              <Target className="h-6 w-6 text-tertiary" />
            </div>
            <h3 className="font-medium text-white mb-1">No Campaign Selected</h3>
            <p className="text-sm text-secondary">Choose a campaign above to view detailed analytics</p>
          </div>
        )}

        {/* Contact breakdown table */}
        {campaignContacts && campaignContacts.contacts.length > 0 && (
          <div className="p-5 border-t border-subtle">
            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-secondary" />
              Contact Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-subtle">
                    <th className="pb-3 pr-4 text-left font-medium text-tertiary">Contact</th>
                    <th className="pb-3 pr-4 text-left font-medium text-tertiary">Status</th>
                    <th className="pb-3 pr-4 text-center font-medium text-tertiary">Sent</th>
                    <th className="pb-3 pr-4 text-center font-medium text-tertiary">Opened</th>
                    <th className="pb-3 pr-4 text-center font-medium text-tertiary">Clicked</th>
                    <th className="pb-3 text-center font-medium text-tertiary">Replied</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignContacts.contacts.slice(0, 10).map((c: any) => (
                    <tr key={c.contact_id} className="border-b border-subtle last:border-0 hover:bg-hover transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-md bg-brand/10 flex items-center justify-center text-brand text-xs font-medium">
                            {(c.first_name?.[0] || c.email[0]).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium text-white">
                              {[c.first_name, c.last_name].filter(Boolean).join(' ') || c.email}
                            </span>
                            {(c.first_name || c.last_name) && (
                              <p className="text-xs text-tertiary">{c.email}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={
                            c.status === 'replied' ? 'purple' :
                            c.status === 'bounced' ? 'danger' :
                            c.status === 'opened' || c.status === 'clicked' ? 'success' :
                            'default'
                          }
                        >
                          {c.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-center text-secondary">{c.sent}</td>
                      <td className="py-3 pr-4 text-center text-secondary">{c.opened}</td>
                      <td className="py-3 pr-4 text-center text-secondary">{c.clicked}</td>
                      <td className="py-3 text-center">
                        {c.replied ? (
                          <span className="inline-flex items-center gap-1 text-brand">
                            <MessageSquare className="h-3.5 w-3.5" />
                            Yes
                          </span>
                        ) : (
                          <span className="text-tertiary">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {campaignContacts.contacts.length > 10 && (
                <p className="mt-3 text-xs text-tertiary text-center">
                  Showing 10 of {campaignContacts.contacts.length} contacts
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
