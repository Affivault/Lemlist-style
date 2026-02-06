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
  color = 'brand',
}: {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color?: 'brand' | 'success' | 'info' | 'warning';
}) {
  const colorMap = {
    brand: {
      iconBg: 'bg-[var(--brand-subtle)]',
      iconColor: 'text-[var(--brand)]',
      accent: 'from-[var(--brand-subtle)] to-transparent',
    },
    success: {
      iconBg: 'bg-[var(--success-bg)]',
      iconColor: 'text-[var(--success)]',
      accent: 'from-[var(--success-bg)] to-transparent',
    },
    info: {
      iconBg: 'bg-[var(--info-bg)]',
      iconColor: 'text-[var(--info)]',
      accent: 'from-[var(--info-bg)] to-transparent',
    },
    warning: {
      iconBg: 'bg-[var(--warning-bg)]',
      iconColor: 'text-[var(--warning)]',
      accent: 'from-[var(--warning-bg)] to-transparent',
    },
  };

  const colors = colorMap[color];

  return (
    <div
      className="relative overflow-hidden p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl transition-all duration-300 hover:border-[var(--border-default)] hover:translate-y-[-2px] group"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* Subtle gradient background accent */}
      <div
        className={cn(
          'absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl opacity-60 rounded-bl-full pointer-events-none transition-opacity duration-300 group-hover:opacity-100',
          colors.accent
        )}
      />

      <div className="relative flex items-start justify-between mb-4">
        <div
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-xl transition-transform duration-300 group-hover:scale-110',
            colors.iconBg
          )}
        >
          <Icon className={cn('h-5 w-5', colors.iconColor)} strokeWidth={1.5} />
        </div>
        {change !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 px-2 py-0.5 text-xs font-semibold rounded-full',
              change >= 0
                ? 'bg-[var(--success-bg)] text-[var(--success)]'
                : 'bg-[var(--error-bg)] text-[var(--error)]'
            )}
          >
            {change >= 0 ? '+' : ''}
            {change}%
          </span>
        )}
      </div>

      <div className="relative">
        <span className="block text-sm text-[var(--text-secondary)] mb-1">{label}</span>
        <span className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
          {value}
        </span>
      </div>
    </div>
  );
}

function CampaignRow({ campaign }: { campaign: Campaign }) {
  const navigate = useNavigate();

  const statusConfig = {
    draft: {
      bg: 'bg-[var(--bg-elevated)]',
      text: 'text-[var(--text-secondary)]',
      dot: 'bg-[var(--text-tertiary)]',
    },
    active: {
      bg: 'bg-[var(--success-bg)]',
      text: 'text-[var(--success)]',
      dot: 'bg-[var(--success)]',
    },
    paused: {
      bg: 'bg-[var(--warning-bg)]',
      text: 'text-[var(--warning)]',
      dot: 'bg-[var(--warning)]',
    },
    completed: {
      bg: 'bg-[var(--bg-elevated)]',
      text: 'text-[var(--text-secondary)]',
      dot: 'bg-[var(--text-tertiary)]',
    },
  };

  const status = statusConfig[campaign.status as keyof typeof statusConfig] || statusConfig.draft;

  return (
    <button
      onClick={() => navigate(`/campaigns/${campaign.id}`)}
      className="w-full flex items-center justify-between py-4 px-5 hover:bg-[var(--bg-hover)] transition-all duration-200 text-left border-b border-[var(--border-subtle)] last:border-b-0 group"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--brand-subtle)]">
          <Megaphone className="h-4 w-4 text-[var(--brand)]" strokeWidth={1.5} />
        </div>
        <div>
          <span className="block text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--brand)] transition-colors">
            {campaign.name}
          </span>
          <span className="block text-xs text-[var(--text-tertiary)] mt-0.5 capitalize">
            {campaign.status} campaign
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full capitalize',
            status.bg,
            status.text
          )}
        >
          <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
          {campaign.status}
        </span>
        <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] transition-all duration-200 group-hover:text-[var(--brand)] group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}

function MetricCard({
  label,
  value,
  subtext,
  percentage,
  color = 'brand',
}: {
  label: string;
  value: string;
  subtext?: string;
  percentage?: number;
  color?: 'brand' | 'success' | 'info';
}) {
  const barColorMap = {
    brand: 'bg-[var(--brand)]',
    success: 'bg-[var(--success)]',
    info: 'bg-[var(--info)]',
  };

  const bgColorMap = {
    brand: 'bg-[var(--brand-subtle)]',
    success: 'bg-[var(--success-bg)]',
    info: 'bg-[var(--info-bg)]',
  };

  return (
    <div
      className="p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl transition-all duration-300 hover:border-[var(--border-default)] hover:translate-y-[-1px]"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      </div>
      <div className="text-2xl font-bold text-[var(--text-primary)] tracking-tight mb-3">
        {value}
      </div>

      {/* Progress bar */}
      {percentage !== undefined && (
        <div className="mb-2">
          <div
            className={cn('w-full h-2 rounded-full', bgColorMap[color])}
          >
            <div
              className={cn('h-2 rounded-full transition-all duration-700 ease-out', barColorMap[color])}
              style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
            />
          </div>
        </div>
      )}

      {subtext && (
        <div className="text-xs text-[var(--text-tertiary)]">{subtext}</div>
      )}
    </div>
  );
}

const quickActions = [
  {
    to: '/campaigns/new',
    icon: Megaphone,
    title: 'New Campaign',
    description: 'Create email sequence',
    gradient: 'from-[var(--brand)] to-[#8B5CF6]',
  },
  {
    to: '/contacts',
    icon: Users,
    title: 'Import Contacts',
    description: 'Upload CSV file',
    gradient: 'from-[var(--success)] to-[#06B6D4]',
  },
  {
    to: '/smtp-accounts',
    icon: Send,
    title: 'SMTP Setup',
    description: 'Connect email',
    gradient: 'from-[var(--info)] to-[#8B5CF6]',
  },
  {
    to: '/analytics',
    icon: MousePointer,
    title: 'Analytics',
    description: 'Track performance',
    gradient: 'from-[var(--warning)] to-[#F97316]',
  },
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
    <div className="max-w-6xl space-y-10 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--brand)] mb-1">
            {getGreeting()}
          </p>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Here is an overview of your email outreach performance
          </p>
        </div>
        <button onClick={() => navigate('/campaigns/new')} className="btn-brand">
          <Plus className="h-4 w-4" />
          New Campaign
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total Campaigns"
          value={stats.total_campaigns}
          icon={Megaphone}
          color="brand"
        />
        <StatCard
          label="Total Contacts"
          value={stats.total_contacts.toLocaleString()}
          icon={Users}
          color="info"
        />
        <StatCard
          label="Emails Sent"
          value={stats.total_sent.toLocaleString()}
          icon={Mail}
          color="success"
        />
        <StatCard
          label="Active Now"
          value={stats.active_campaigns}
          icon={ArrowUpRight}
          color="warning"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Campaigns */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-[var(--text-primary)] tracking-tight">
              Recent Campaigns
            </h2>
            <Link
              to="/campaigns"
              className="inline-flex items-center gap-1 text-sm font-medium text-[var(--brand)] hover:text-[var(--brand-hover)] transition-colors"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div
            className="border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-surface)] overflow-hidden"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            {recentCampaigns.length > 0 ? (
              recentCampaigns.slice(0, 5).map((campaign: any) => (
                <CampaignRow key={campaign.id} campaign={campaign} />
              ))
            ) : (
              <div className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--brand-subtle)] mb-4">
                  <Megaphone className="h-7 w-7 text-[var(--brand)]" strokeWidth={1.5} />
                </div>
                <p className="text-base font-semibold text-[var(--text-primary)] mb-1">
                  No campaigns yet
                </p>
                <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-xs mx-auto">
                  Create your first campaign to start reaching your audience
                </p>
                <button onClick={() => navigate('/campaigns/new')} className="btn-brand">
                  <Plus className="h-4 w-4" />
                  Create Campaign
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Engagement Metrics */}
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)] tracking-tight mb-5">
            Engagement
          </h2>
          <div className="space-y-4">
            <MetricCard
              label="Open Rate"
              value={`${stats.avg_open_rate}%`}
              subtext={`${stats.total_opened.toLocaleString()} emails opened`}
              percentage={stats.avg_open_rate}
              color="brand"
            />
            <MetricCard
              label="Click Rate"
              value={`${stats.avg_click_rate}%`}
              subtext={`${stats.total_clicked.toLocaleString()} links clicked`}
              percentage={stats.avg_click_rate}
              color="success"
            />
            <MetricCard
              label="Reply Rate"
              value={`${stats.avg_reply_rate}%`}
              subtext={`${stats.total_replied.toLocaleString()} total replies`}
              percentage={stats.avg_reply_rate}
              color="info"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold text-[var(--text-primary)] tracking-tight mb-5">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="relative overflow-hidden p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl hover:border-[var(--border-default)] transition-all duration-300 hover:translate-y-[-2px] group"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              {/* Gradient top accent bar */}
              <div
                className={cn(
                  'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                  action.gradient
                )}
              />

              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--bg-elevated)] mb-3 transition-all duration-300 group-hover:scale-110 group-hover:bg-[var(--brand-subtle)]">
                <action.icon
                  className="h-5 w-5 text-[var(--text-tertiary)] transition-colors duration-300 group-hover:text-[var(--brand)]"
                  strokeWidth={1.5}
                />
              </div>
              <div className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">
                {action.title}
              </div>
              <div className="text-xs text-[var(--text-tertiary)]">
                {action.description}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
