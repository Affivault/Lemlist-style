import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analytics.api';
import { Spinner } from '../../components/ui/Spinner';
import {
  BarChart3,
  Users,
  Send,
  Mail,
  MousePointerClick,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="card flex items-start gap-4 p-5">
      <div className="rounded-lg bg-primary-50 p-3">
        <Icon className="h-5 w-5 text-primary-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: analyticsApi.overview,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const stats = data || {
    total_campaigns: 0,
    active_campaigns: 0,
    total_contacts: 0,
    total_sent: 0,
    total_opened: 0,
    total_clicked: 0,
    total_replied: 0,
    avg_open_rate: 0,
    avg_click_rate: 0,
    avg_reply_rate: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Overview of your outreach performance</p>
        </div>
        <Button onClick={() => navigate('/campaigns/new')}>
          <Zap className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BarChart3} label="Total Campaigns" value={stats.total_campaigns} sub={`${stats.active_campaigns} active`} />
        <StatCard icon={Users} label="Total Contacts" value={stats.total_contacts} />
        <StatCard icon={Send} label="Emails Sent" value={stats.total_sent} />
        <StatCard icon={MessageSquare} label="Replies" value={stats.total_replied} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Mail} label="Avg Open Rate" value={`${stats.avg_open_rate}%`} sub={`${stats.total_opened} opens`} />
        <StatCard icon={MousePointerClick} label="Avg Click Rate" value={`${stats.avg_click_rate}%`} sub={`${stats.total_clicked} clicks`} />
        <StatCard icon={MessageSquare} label="Avg Reply Rate" value={`${stats.avg_reply_rate}%`} sub={`${stats.total_replied} replies`} />
      </div>
    </div>
  );
}
