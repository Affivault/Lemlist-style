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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import {
  Send,
  Mail,
  MousePointerClick,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
} from 'lucide-react';

const COLORS = ['#6366f1', '#22d3ee', '#a78bfa', '#f472b6', '#fb923c'];

function StatCard({
  icon: Icon,
  label,
  value,
  rate,
  trend,
  color,
  gradient,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  rate?: number;
  trend?: number;
  color: string;
  gradient: string;
}) {
  const isPositive = trend !== undefined && trend >= 0;
  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className={`absolute inset-0 opacity-[0.03] ${gradient}`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2.5 rounded-xl ${gradient}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
              {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-gray-500">{label}</p>
          {rate !== undefined && (
            <p className="text-sm font-medium text-gray-600">{rate.toFixed(1)}% rate</p>
          )}
        </div>
      </div>
    </div>
  );
}

function EngagementRing({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Breakdown</h3>
      <div className="flex items-center gap-8">
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [value.toLocaleString(), 'Count']}
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-3">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{item.value.toLocaleString()}</span>
                <span className="text-xs text-gray-400">
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
        { name: 'Sent', value: campaignAnalytics.sent, fill: '#6366f1' },
        { name: 'Opened', value: campaignAnalytics.opened, fill: '#22d3ee' },
        { name: 'Clicked', value: campaignAnalytics.clicked, fill: '#a78bfa' },
        { name: 'Replied', value: campaignAnalytics.replied, fill: '#f472b6' },
        { name: 'Bounced', value: campaignAnalytics.bounced, fill: '#fb923c' },
      ]
    : [];

  // Mock trend data for the area chart
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-gray-500">Track your email campaign performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
              className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard
            icon={Send}
            label="Total Sent"
            value={overview.total_sent}
            trend={12}
            color="text-indigo-500"
            gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
          />
          <StatCard
            icon={Mail}
            label="Opened"
            value={overview.total_opened}
            rate={overview.avg_open_rate}
            trend={8}
            color="text-cyan-500"
            gradient="bg-gradient-to-br from-cyan-500 to-cyan-600"
          />
          <StatCard
            icon={MousePointerClick}
            label="Clicked"
            value={overview.total_clicked}
            rate={overview.avg_click_rate}
            trend={-3}
            color="text-violet-500"
            gradient="bg-gradient-to-br from-violet-500 to-violet-600"
          />
          <StatCard
            icon={MessageSquare}
            label="Replied"
            value={overview.total_replied}
            rate={overview.avg_reply_rate}
            trend={15}
            color="text-pink-500"
            gradient="bg-gradient-to-br from-pink-500 to-pink-600"
          />
          <StatCard
            icon={Target}
            label="Campaigns"
            value={overview.total_campaigns}
            color="text-orange-500"
            gradient="bg-gradient-to-br from-orange-500 to-orange-600"
          />
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sent"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#colorSent)"
                  name="Sent"
                />
                <Area
                  type="monotone"
                  dataKey="opened"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fill="url(#colorOpened)"
                  name="Opened"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement ring */}
        {pieData.length > 0 && <EngagementRing data={pieData} />}
      </div>

      {/* Campaign Deep Dive */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Campaign Deep Dive</h2>
              <p className="text-sm text-gray-500 mt-0.5">Select a campaign to view detailed analytics</p>
            </div>
            <div className="relative">
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer min-w-[200px]"
              >
                <option value="">Choose a campaign...</option>
                {campaigns.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {campaignAnalytics ? (
          <div className="p-6 space-y-6">
            {/* Campaign stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                  <Send className="h-4 w-4" />
                  <span className="text-sm font-medium">Sent</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{campaignAnalytics.sent}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-cyan-50 to-white rounded-xl border border-cyan-100">
                <div className="flex items-center gap-2 text-cyan-600 mb-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm font-medium">Opened</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{campaignAnalytics.opened}</p>
                <p className="text-xs text-gray-500 mt-1">{campaignAnalytics.open_rate?.toFixed(1)}% rate</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-violet-50 to-white rounded-xl border border-violet-100">
                <div className="flex items-center gap-2 text-violet-600 mb-2">
                  <MousePointerClick className="h-4 w-4" />
                  <span className="text-sm font-medium">Clicked</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{campaignAnalytics.clicked}</p>
                <p className="text-xs text-gray-500 mt-1">{campaignAnalytics.click_rate?.toFixed(1)}% rate</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-red-50 to-white rounded-xl border border-red-100">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Bounced</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{campaignAnalytics.bounced}</p>
                <p className="text-xs text-gray-500 mt-1">{campaignAnalytics.bounce_rate?.toFixed(1)}% rate</p>
              </div>
            </div>

            {/* Bar chart */}
            {chartData.length > 0 && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[8, 8, 0, 0]}
                      fill="#6366f1"
                    >
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
          <div className="p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Target className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Campaign Selected</h3>
            <p className="text-gray-500">Choose a campaign above to view detailed analytics</p>
          </div>
        )}

        {/* Contact breakdown table */}
        {campaignContacts && campaignContacts.contacts.length > 0 && (
          <div className="p-6 border-t border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-400" />
              Contact Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 pr-4 text-left font-medium text-gray-500">Contact</th>
                    <th className="pb-3 pr-4 text-left font-medium text-gray-500">Status</th>
                    <th className="pb-3 pr-4 text-center font-medium text-gray-500">Sent</th>
                    <th className="pb-3 pr-4 text-center font-medium text-gray-500">Opened</th>
                    <th className="pb-3 pr-4 text-center font-medium text-gray-500">Clicked</th>
                    <th className="pb-3 text-center font-medium text-gray-500">Replied</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignContacts.contacts.slice(0, 10).map((c: any) => (
                    <tr key={c.contact_id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                            {(c.first_name?.[0] || c.email[0]).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">
                              {[c.first_name, c.last_name].filter(Boolean).join(' ') || c.email}
                            </span>
                            {(c.first_name || c.last_name) && (
                              <p className="text-xs text-gray-400">{c.email}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={
                            c.status === 'replied'
                              ? 'purple'
                              : c.status === 'bounced'
                              ? 'danger'
                              : c.status === 'opened' || c.status === 'clicked'
                              ? 'success'
                              : 'default'
                          }
                        >
                          {c.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-center text-gray-600">{c.sent}</td>
                      <td className="py-3 pr-4 text-center text-gray-600">{c.opened}</td>
                      <td className="py-3 pr-4 text-center text-gray-600">{c.clicked}</td>
                      <td className="py-3 text-center">
                        {c.replied ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <MessageSquare className="h-4 w-4" />
                            Yes
                          </span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {campaignContacts.contacts.length > 10 && (
                <p className="mt-4 text-sm text-gray-500 text-center">
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
