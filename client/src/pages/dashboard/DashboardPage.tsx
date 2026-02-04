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
  Plus,
  UserPlus,
  TrendingUp,
  TrendingDown,
  ChevronRight,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  trend?: number;
}) {
  return (
    <div className="bg-surface border border-subtle rounded-lg p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-secondary" />
            <span className="text-sm text-secondary">{label}</span>
          </div>
          <p className="text-2xl font-semibold text-primary">{value}</p>
          {sub && <p className="text-sm text-secondary">{sub}</p>}
        </div>

        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
              trend >= 0
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            }`}
          >
            {trend >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  percentage,
  total,
}: {
  icon: React.ElementType;
  label: string;
  percentage: number;
  total: number;
}) {
  return (
    <div className="bg-surface border border-subtle rounded-lg p-5">
      <div className="flex items-center gap-3 mb-4">
        <Icon className="h-5 w-5 text-secondary" />
        <span className="text-sm text-secondary">{label}</span>
      </div>
      <p className="text-3xl font-semibold text-primary mb-1">{percentage}%</p>
      <p className="text-sm text-secondary">{total.toLocaleString()} total</p>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
}) {
  return (
    <Link
      to={href}
      className="flex items-center justify-between py-3 px-4 rounded-lg text-secondary hover:text-primary hover:bg-hover transition-colors group"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
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
      <div className="flex h-[60vh] items-center justify-center">
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
    <div className="space-y-10 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Dashboard</h1>
          <p className="text-sm text-secondary mt-1">Your outreach overview</p>
        </div>
        <button
          onClick={() => navigate('/campaigns/new')}
          className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-primary text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </button>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-sm font-medium text-secondary uppercase tracking-wide mb-4">
          Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={BarChart3}
            label="Campaigns"
            value={stats.total_campaigns}
            sub={`${stats.active_campaigns} active`}
            trend={12}
          />
          <StatCard
            icon={Users}
            label="Contacts"
            value={stats.total_contacts.toLocaleString()}
            trend={8}
          />
          <StatCard
            icon={Send}
            label="Emails Sent"
            value={stats.total_sent.toLocaleString()}
            trend={24}
          />
          <StatCard
            icon={MessageSquare}
            label="Replies"
            value={stats.total_replied.toLocaleString()}
            trend={15}
          />
        </div>
      </div>

      {/* Engagement Metrics */}
      <div>
        <h2 className="text-sm font-medium text-secondary uppercase tracking-wide mb-4">
          Engagement
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            icon={Mail}
            label="Open Rate"
            percentage={stats.avg_open_rate}
            total={stats.total_opened}
          />
          <MetricCard
            icon={MousePointerClick}
            label="Click Rate"
            percentage={stats.avg_click_rate}
            total={stats.total_clicked}
          />
          <MetricCard
            icon={MessageSquare}
            label="Reply Rate"
            percentage={stats.avg_reply_rate}
            total={stats.total_replied}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-medium text-secondary uppercase tracking-wide mb-4">
          Quick Actions
        </h2>
        <div className="bg-surface border border-subtle rounded-lg divide-y divide-subtle">
          <QuickAction
            icon={Plus}
            label="Create a new campaign"
            href="/campaigns/new"
          />
          <QuickAction
            icon={UserPlus}
            label="Import contacts"
            href="/contacts"
          />
          <QuickAction
            icon={Mail}
            label="Connect SMTP account"
            href="/smtp-accounts"
          />
        </div>
      </div>
    </div>
  );
}
