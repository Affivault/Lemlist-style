import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analytics.api';
import { campaignsApi } from '../../api/campaigns.api';
import { Spinner } from '../../components/ui/Spinner';
import {
  Plus,
  ArrowUpRight,
  Megaphone,
  Users,
  Mail,
  MousePointer,
  ArrowRight,
  Send,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import type { Campaign } from '@lemlist/shared';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function StatCard({
  label,
  value,
  change,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl hover:border-[var(--border-default)] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <Icon className="h-4 w-4 text-[var(--text-tertiary)]" strokeWidth={1.5} />
        {change !== undefined && (
          <span
            className={cn(
              'text-xs font-medium',
              change >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'
            )}
          >
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <span className="block text-2xl font-semibold text-[var(--text-primary)] tracking-tight">{value}</span>
      <span className="block text-sm text-[var(--text-secondary)] mt-1">{label}</span>
    </div>
  );
}

function CampaignRow({ campaign }: { campaign: Campaign }) {
  const navigate = useNavigate();

  const statusConfig = {
    draft: { bg: 'bg-[var(--bg-elevated)]', text: 'text-[var(--text-secondary)]' },
    active: { bg: 'bg-[var(--success-bg)]', text: 'text-[var(--success)]' },
    paused: { bg: 'bg-[var(--warning-bg)]', text: 'text-[var(--warning)]' },
    completed: { bg: 'bg-[var(--bg-elevated)]', text: 'text-[var(--text-tertiary)]' },
  };

  const status = statusConfig[campaign.status as keyof typeof statusConfig] || statusConfig.draft;

  return (
    <button
      onClick={() => navigate(`/campaigns/${campaign.id}`)}
      className="w-full flex items-center justify-between py-3.5 px-5 hover:bg-[var(--bg-hover)] transition-colors text-left border-b border-[var(--border-subtle)] last:border-b-0 group"
    >
      <div className="flex items-center gap-3">
        <Megaphone className="h-4 w-4 text-[var(--text-tertiary)]" strokeWidth={1.5} />
        <div>
          <span className="block text-sm font-medium text-[var(--text-primary)]">{campaign.name}</span>
          <span className="block text-xs text-[var(--text-tertiary)] mt-0.5 capitalize">{campaign.status}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full capitalize', status.bg, status.text)}>
          {campaign.status}
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors" />
      </div>
    </button>
  );
}

function MetricCard({
  label,
  value,
  subtext,
  percentage,
}: {
  label: string;
  value: string;
  subtext?: string;
  percentage?: number;
  color?: string;
}) {
  return (
    <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl hover:border-[var(--border-default)] transition-colors">
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      <div className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight mt-1 mb-3">{value}</div>
      {percentage !== undefined && (
        <div className="w-full h-1.5 rounded-full bg-[var(--bg-elevated)] mb-2">
          <div
            className="h-1.5 rounded-full bg-[var(--text-primary)] transition-all duration-700 ease-out"
            style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
          />
        </div>
      )}
      {subtext && <div className="text-xs text-[var(--text-tertiary)]">{subtext}</div>}
    </div>
  );
}

const quickActions = [
  { to: '/campaigns/new', icon: Megaphone, title: 'New Campaign', description: 'Create email sequence' },
  { to: '/contacts', icon: Users, title: 'Import Contacts', description: 'Upload CSV file' },
  { to: '/smtp-accounts', icon: Send, title: 'SMTP Setup', description: 'Connect email' },
  { to: '/analytics', icon: MousePointer, title: 'Analytics', description: 'Track performance' },
] as const;

export function DashboardPage() {
  const navigate = useNavigate();

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: analyticsApi.overview,
  });

  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignsApi.list({ limit: 5 }),
  });

  const isLoading = analyticsLoading || campaignsLoading;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const stats = analytics || {
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

  const recentCampaigns = campaigns?.data || [];

  return (
    <div className="max-w-6xl space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-[var(--text-tertiary)] mb-1">{getGreeting()}</p>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">Dashboard</h1>
        </div>
        <button onClick={() => navigate('/campaigns/new')} className="btn-primary">
          <Plus className="h-4 w-4" />
          New Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Campaigns" value={stats.total_campaigns} icon={Megaphone} />
        <StatCard label="Total Contacts" value={stats.total_contacts.toLocaleString()} icon={Users} />
        <StatCard label="Emails Sent" value={stats.total_sent.toLocaleString()} icon={Mail} />
        <StatCard label="Active Now" value={stats.active_campaigns} icon={ArrowUpRight} />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Recent Campaigns</h2>
            <Link to="/campaigns" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-surface)] overflow-hidden">
            {recentCampaigns.length > 0 ? (
              recentCampaigns.slice(0, 5).map((campaign: any) => (
                <CampaignRow key={campaign.id} campaign={campaign} />
              ))
            ) : (
              <div className="py-16 text-center">
                <Megaphone className="h-6 w-6 text-[var(--text-tertiary)] mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-sm font-medium text-[var(--text-primary)] mb-1">No campaigns yet</p>
                <p className="text-sm text-[var(--text-secondary)] mb-6">Create your first campaign to get started</p>
                <button onClick={() => navigate('/campaigns/new')} className="btn-primary">
                  <Plus className="h-4 w-4" />
                  Create Campaign
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Engagement</h2>
          <div className="space-y-3">
            <MetricCard
              label="Open Rate"
              value={`${stats.avg_open_rate}%`}
              subtext={`${stats.total_opened.toLocaleString()} emails opened`}
              percentage={stats.avg_open_rate}
            />
            <MetricCard
              label="Click Rate"
              value={`${stats.avg_click_rate}%`}
              subtext={`${stats.total_clicked.toLocaleString()} links clicked`}
              percentage={stats.avg_click_rate}
            />
            <MetricCard
              label="Reply Rate"
              value={`${stats.avg_reply_rate}%`}
              subtext={`${stats.total_replied.toLocaleString()} total replies`}
              percentage={stats.avg_reply_rate}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl hover:border-[var(--border-default)] transition-colors group"
            >
              <action.icon className="h-4 w-4 text-[var(--text-tertiary)] mb-3 group-hover:text-[var(--text-primary)] transition-colors" strokeWidth={1.5} />
              <div className="text-sm font-medium text-[var(--text-primary)]">{action.title}</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{action.description}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
