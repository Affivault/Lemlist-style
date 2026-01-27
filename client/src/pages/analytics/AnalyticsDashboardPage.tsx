import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analytics.api';
import { campaignsApi } from '../../api/campaigns.api';
import { Spinner } from '../../components/ui/Spinner';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, Send, Mail, MousePointerClick, MessageSquare, AlertTriangle } from 'lucide-react';

function MetricCard({ icon: Icon, label, value, rate, color }: {
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
      {rate !== undefined && (
        <p className="text-xs text-gray-400">{rate}% rate</p>
      )}
    </div>
  );
}

export function AnalyticsDashboardPage() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');

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
        { name: 'Sent', value: campaignAnalytics.sent },
        { name: 'Opened', value: campaignAnalytics.opened },
        { name: 'Clicked', value: campaignAnalytics.clicked },
        { name: 'Replied', value: campaignAnalytics.replied },
        { name: 'Bounced', value: campaignAnalytics.bounced },
      ]
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      {/* Overview */}
      {overview && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <MetricCard icon={Send} label="Total Sent" value={overview.total_sent} color="text-blue-500" />
          <MetricCard icon={Mail} label="Opened" value={overview.total_opened} rate={overview.avg_open_rate} color="text-green-500" />
          <MetricCard icon={MousePointerClick} label="Clicked" value={overview.total_clicked} rate={overview.avg_click_rate} color="text-purple-500" />
          <MetricCard icon={MessageSquare} label="Replied" value={overview.total_replied} rate={overview.avg_reply_rate} color="text-indigo-500" />
          <MetricCard icon={BarChart3} label="Campaigns" value={overview.total_campaigns} color="text-gray-500" />
        </div>
      )}

      {/* Campaign selector */}
      <div className="card p-5">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Campaign Analytics</h2>
        <Select
          label="Select a campaign"
          value={selectedCampaignId}
          onChange={(e) => setSelectedCampaignId(e.target.value)}
          options={[
            { value: '', label: 'Choose a campaign...' },
            ...campaigns.map((c: any) => ({ value: c.id, label: c.name })),
          ]}
        />

        {campaignAnalytics && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <MetricCard icon={Send} label="Sent" value={campaignAnalytics.sent} color="text-blue-500" />
              <MetricCard icon={Mail} label="Opened" value={campaignAnalytics.opened} rate={campaignAnalytics.open_rate} color="text-green-500" />
              <MetricCard icon={MousePointerClick} label="Clicked" value={campaignAnalytics.clicked} rate={campaignAnalytics.click_rate} color="text-purple-500" />
              <MetricCard icon={AlertTriangle} label="Bounced" value={campaignAnalytics.bounced} rate={campaignAnalytics.bounce_rate} color="text-red-500" />
            </div>

            {chartData.length > 0 && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Contact breakdown table */}
        {campaignContacts && campaignContacts.contacts.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 font-medium text-gray-700">Contact Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 pr-4">Email</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Sent</th>
                    <th className="pb-2 pr-4">Opened</th>
                    <th className="pb-2 pr-4">Clicked</th>
                    <th className="pb-2">Replied</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignContacts.contacts.map((c: any) => (
                    <tr key={c.contact_id} className="border-b border-gray-50">
                      <td className="py-2 pr-4">
                        <div>
                          <span className="text-gray-900">
                            {[c.first_name, c.last_name].filter(Boolean).join(' ') || c.email}
                          </span>
                          {(c.first_name || c.last_name) && (
                            <span className="ml-2 text-gray-400">{c.email}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 pr-4">
                        <Badge variant={c.status === 'replied' ? 'purple' : c.status === 'bounced' ? 'danger' : 'default'}>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4">{c.sent}</td>
                      <td className="py-2 pr-4">{c.opened}</td>
                      <td className="py-2 pr-4">{c.clicked}</td>
                      <td className="py-2">{c.replied ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
