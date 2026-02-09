import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analytics.api';
import { campaignsApi } from '../../api/campaigns.api';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { useTheme } from '../../context/ThemeContext';
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

/* Monochrome palette for charts — separate light and dark palettes */
const LIGHT_COLORS = ['#0A0A0B', '#6B6B76', '#9B9BA5', '#CDCDD6'];
const DARK_COLORS = ['#FAFAFB', '#9B9BA5', '#6B6B76', '#3A3A42'];

const tooltipStyle = {
  backgroundColor: 'var(--bg-elevated)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '12px',
  boxShadow: 'var(--shadow-lg)',
  padding: '10px 14px',
};

const tooltipLabelStyle = {
  color: 'var(--text-primary)',
  fontWeight: 600,
  marginBottom: '4px',
};

const tooltipItemStyle = {
  color: 'var(--text-secondary)',
  fontSize: '13px',
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
    <div
      className="relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 transition-all duration-300 hover:border-[var(--border-default)] hover:translate-y-[-2px] group"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="relative flex items-center justify-between mb-4">
        <div
          className="flex items-center justify-center h-10 w-10 rounded-xl bg-[var(--bg-elevated)] transition-transform duration-300 group-hover:scale-110"
        >
          <Icon className="h-5 w-5 text-[var(--text-primary)]" strokeWidth={1.5} />
        </div>
        {trend !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 px-2 py-0.5 text-xs font-semibold rounded-full ${
              trend >= 0
                ? 'bg-[var(--success-bg)] text-[var(--success)]'
                : 'bg-[var(--error-bg)] text-[var(--error)]'
            }`}
          >
            {trend >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trend >= 0 ? '+' : ''}
            {trend}%
          </span>
        )}
      </div>

      <div className="relative">
        <p className="stat-value">{value.toLocaleString()}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="stat-label">{label}</p>
          {rate !== undefined && (
            <span className="text-xs font-medium px-1.5 py-0.5 rounded-md bg-[var(--bg-elevated)] text-[var(--text-tertiary)]">
              {rate.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function EngagementRing({ data, colors }: { data: { name: string; value: number }[]; colors: string[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <div
      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 transition-all duration-300 hover:border-[var(--border-default)]"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <h3 className="text-heading-sm text-[var(--text-primary)] mb-5">Engagement Breakdown</h3>
      <div className="flex items-center gap-6">
        <div className="w-44 h-44 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={68}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [value.toLocaleString(), 'Count']}
                contentStyle={tooltipStyle}
                itemStyle={tooltipItemStyle}
                labelStyle={tooltipLabelStyle}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-3">
          {data.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: colors[index % colors.length],
                    boxShadow: `0 0 0 2px var(--bg-surface), 0 0 0 3.5px ${colors[index % colors.length]}30`,
                  }}
                />
                <span className="text-sm text-[var(--text-secondary)]">{item.name}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {item.value.toLocaleString()}
                </span>
                <span className="text-xs font-medium text-[var(--text-tertiary)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">
                  {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%
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
  const { theme } = useTheme();
  const COLORS = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
  const primaryChartColor = theme === 'dark' ? '#FAFAFB' : '#0A0A0B';
  const secondaryChartColor = theme === 'dark' ? '#9B9BA5' : '#6B6B76';

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

  const chartData = useMemo(() => campaignAnalytics
    ? [
        { name: 'Sent', value: campaignAnalytics.sent, fill: COLORS[0] },
        { name: 'Opened', value: campaignAnalytics.opened, fill: COLORS[1] },
        { name: 'Clicked', value: campaignAnalytics.clicked, fill: COLORS[2] },
        { name: 'Replied', value: campaignAnalytics.replied, fill: COLORS[3] },
        { name: 'Bounced', value: campaignAnalytics.bounced, fill: theme === 'dark' ? '#24242A' : '#E4E4E7' },
      ]
    : [], [campaignAnalytics, COLORS, theme]);

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

  const dateRangeOptions: { value: '7d' | '30d' | '90d'; label: string }[] = [
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '90 days' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-heading-lg text-[var(--text-primary)]">Analytics</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1.5">
            Monitor performance, engagement, and delivery metrics across all your campaigns.
          </p>
        </div>
        <div className="flex items-center">
          <div className="tab-bar border-b-0 gap-0">
            {dateRangeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDateRange(opt.value)}
                className={`tab-item text-xs px-3 py-2 ${
                  dateRange === opt.value ? 'active' : ''
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="ml-3 pl-3 border-l border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">
                Last {dateRange === '7d' ? '7' : dateRange === '30d' ? '30' : '90'} days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-5 gap-5">
          <StatCard
            icon={Send}
            label="Total Sent"
            value={overview.total_sent}
            trend={12}
          />
          <StatCard
            icon={Mail}
            label="Opened"
            value={overview.total_opened}
            rate={overview.avg_open_rate}
            trend={8}
          />
          <StatCard
            icon={MousePointerClick}
            label="Clicked"
            value={overview.total_clicked}
            rate={overview.avg_click_rate}
            trend={-3}
          />
          <StatCard
            icon={MessageSquare}
            label="Replied"
            value={overview.total_replied}
            rate={overview.avg_reply_rate}
            trend={15}
          />
          <StatCard
            icon={Target}
            label="Campaigns"
            value={overview.total_campaigns}
          />
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Trend chart */}
        <div
          className="col-span-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 transition-all duration-300 hover:border-[var(--border-default)]"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-heading-sm text-[var(--text-primary)]">Weekly Performance</h3>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                Email sends vs. opens over time
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryChartColor }} />
                <span className="text-xs text-[var(--text-tertiary)]">Sent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: secondaryChartColor }} />
                <span className="text-xs text-[var(--text-tertiary)]">Opened</span>
              </div>
            </div>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={primaryChartColor} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={primaryChartColor} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={secondaryChartColor} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={secondaryChartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                  dx={-8}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={tooltipItemStyle}
                  labelStyle={tooltipLabelStyle}
                  cursor={{ stroke: 'var(--border-default)', strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="sent"
                  stroke={primaryChartColor}
                  strokeWidth={2.5}
                  fill="url(#colorSent)"
                  name="Sent"
                  dot={false}
                  activeDot={{ r: 5, fill: primaryChartColor, stroke: 'var(--bg-surface)', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="opened"
                  stroke={secondaryChartColor}
                  strokeWidth={2.5}
                  fill="url(#colorOpened)"
                  name="Opened"
                  dot={false}
                  activeDot={{ r: 5, fill: secondaryChartColor, stroke: 'var(--bg-surface)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement ring */}
        {pieData.length > 0 && <EngagementRing data={pieData} colors={COLORS} />}
      </div>

      {/* Campaign Deep Dive */}
      <div
        className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden transition-all duration-300"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="p-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-heading-sm text-[var(--text-primary)]">Campaign Deep Dive</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                Select a campaign to view detailed analytics
              </p>
            </div>
            <div className="relative">
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] min-w-[220px] transition-all duration-200 cursor-pointer"
              >
                <option value="">Choose a campaign...</option>
                {campaigns.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)] pointer-events-none" />
            </div>
          </div>
        </div>

        {campaignAnalytics ? (
          <div className="p-6 space-y-6">
            {/* Campaign stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="relative overflow-hidden p-5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] transition-all duration-200 hover:border-[var(--border-default)] group">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[var(--bg-surface)]">
                    <Send className="h-4 w-4 text-[var(--text-primary)]" />
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)]">Sent</span>
                </div>
                <p className="stat-value">{campaignAnalytics.sent}</p>
              </div>

              <div className="relative overflow-hidden p-5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] transition-all duration-200 hover:border-[var(--border-default)] group">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[var(--bg-surface)]">
                    <Mail className="h-4 w-4 text-[var(--text-primary)]" />
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)]">Opened</span>
                </div>
                <p className="stat-value">{campaignAnalytics.opened}</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1 font-medium">
                  {campaignAnalytics.open_rate?.toFixed(1)}% rate
                </p>
              </div>

              <div className="relative overflow-hidden p-5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] transition-all duration-200 hover:border-[var(--border-default)] group">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[var(--bg-surface)]">
                    <MousePointerClick className="h-4 w-4 text-[var(--text-primary)]" />
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)]">Clicked</span>
                </div>
                <p className="stat-value">{campaignAnalytics.clicked}</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1 font-medium">
                  {campaignAnalytics.click_rate?.toFixed(1)}% rate
                </p>
              </div>

              <div className="relative overflow-hidden p-5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] transition-all duration-200 hover:border-[var(--border-default)] group">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[var(--bg-surface)]">
                    <AlertTriangle className="h-4 w-4 text-[var(--text-primary)]" />
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)]">Bounced</span>
                </div>
                <p className="stat-value">{campaignAnalytics.bounced}</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1 font-medium">
                  {campaignAnalytics.bounce_rate?.toFixed(1)}% rate
                </p>
              </div>
            </div>

            {/* Bar chart */}
            {chartData.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-[var(--text-primary)] mb-4">
                  Campaign Funnel
                </h4>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barSize={40}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                        dy={8}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                        dx={-8}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        itemStyle={tooltipItemStyle}
                        labelStyle={tooltipLabelStyle}
                        cursor={{ fill: 'var(--bg-hover)', radius: 8 }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} name="Count">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4 border border-[var(--border-subtle)]">
              <Target className="h-6 w-6 text-[var(--text-tertiary)]" />
            </div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-1.5">No Campaign Selected</h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-xs mx-auto">
              Choose a campaign from the dropdown above to explore detailed performance analytics.
            </p>
          </div>
        )}

        {/* Contact breakdown table */}
        {campaignContacts && campaignContacts.contacts.length > 0 && (
          <div className="p-6 border-t border-[var(--border-subtle)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-5 flex items-center gap-2.5">
              <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-[var(--bg-elevated)]">
                <Users className="h-3.5 w-3.5 text-[var(--text-primary)]" />
              </div>
              Contact Breakdown
            </h3>
            <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[var(--bg-elevated)]">
                    <th className="table-header py-3 px-4 text-left">Contact</th>
                    <th className="table-header py-3 px-4 text-left">Status</th>
                    <th className="table-header py-3 px-4 text-center">Sent</th>
                    <th className="table-header py-3 px-4 text-center">Opened</th>
                    <th className="table-header py-3 px-4 text-center">Clicked</th>
                    <th className="table-header py-3 px-4 text-center">Replied</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignContacts.contacts.slice(0, 10).map((c: any) => (
                    <tr
                      key={c.contact_id}
                      className="border-t border-[var(--border-subtle)] transition-colors duration-150 hover:bg-[var(--bg-hover)]"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-primary)] text-xs font-semibold border border-[var(--border-subtle)]">
                            {(c.first_name?.[0] || c.email[0]).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium text-[var(--text-primary)]">
                              {[c.first_name, c.last_name].filter(Boolean).join(' ') || c.email}
                            </span>
                            {(c.first_name || c.last_name) && (
                              <p className="text-xs text-[var(--text-tertiary)]">{c.email}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            c.status === 'replied' ? 'info' :
                            c.status === 'bounced' ? 'danger' :
                            c.status === 'opened' || c.status === 'clicked' ? 'success' :
                            'default'
                          }
                        >
                          {c.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center text-[var(--text-secondary)] font-medium">
                        {c.sent}
                      </td>
                      <td className="py-3.5 px-4 text-center text-[var(--text-secondary)] font-medium">
                        {c.opened}
                      </td>
                      <td className="py-3.5 px-4 text-center text-[var(--text-secondary)] font-medium">
                        {c.clicked}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {c.replied ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--bg-elevated)] text-[var(--text-primary)]">
                            <MessageSquare className="h-3 w-3" />
                            Yes
                          </span>
                        ) : (
                          <span className="text-[var(--text-tertiary)]">--</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {campaignContacts.contacts.length > 10 && (
                <div className="py-3 px-4 text-center bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)]">
                  <p className="text-xs font-medium text-[var(--text-tertiary)]">
                    Showing 10 of {campaignContacts.contacts.length} contacts
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
