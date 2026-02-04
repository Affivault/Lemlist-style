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
}) {
  return (
    <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
        <Icon className="h-4 w-4 text-[var(--text-tertiary)]" strokeWidth={1.5} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
          {value}
        </span>
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
    </div>
  );
}

function CampaignRow({ campaign }: { campaign: Campaign }) {
  const navigate = useNavigate();

  const statusStyles = {
    draft: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]',
    active: 'bg-[var(--success-bg)] text-[var(--success)]',
    paused: 'bg-[var(--warning-bg)] text-[var(--warning)]',
    completed: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]',
  };

  return (
    <button
      onClick={() => navigate(`/campaigns/${campaign.id}`)}
      className="w-full flex items-center justify-between py-3 px-4 hover:bg-[var(--bg-hover)] transition-colors text-left border-b border-[var(--border-subtle)] last:border-b-0"
    >
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {campaign.name}
        </span>
        <span
          className={cn(
            'px-2 py-0.5 text-xs font-medium rounded capitalize',
            statusStyles[campaign.status as keyof typeof statusStyles] || statusStyles.draft
          )}
        >
          {campaign.status}
        </span>
      </div>
      <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)]" />
    </button>
  );
}

function MetricCard({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <div className="p-4 border border-[var(--border-subtle)] rounded-lg">
      <div className="text-sm text-[var(--text-secondary)] mb-1">{label}</div>
      <div className="text-xl font-semibold text-[var(--text-primary)]">{value}</div>
      {subtext && (
        <div className="text-xs text-[var(--text-tertiary)] mt-1">{subtext}</div>
      )}
    </div>
  );
}

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
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Overview of your email outreach performance
          </p>
        </div>
        <button onClick={() => navigate('/campaigns/new')} className="btn-primary">
          <Plus className="h-4 w-4" />
          New Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Campaigns"
          value={stats.total_campaigns}
          icon={Megaphone}
        />
        <StatCard
          label="Contacts"
          value={stats.total_contacts.toLocaleString()}
          icon={Users}
        />
        <StatCard
          label="Emails Sent"
          value={stats.total_sent.toLocaleString()}
          icon={Mail}
        />
        <StatCard
          label="Active"
          value={stats.active_campaigns}
          icon={ArrowUpRight}
        />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Recent campaigns */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Recent Campaigns
            </h2>
            <Link
              to="/campaigns"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              View all
            </Link>
          </div>

          <div className="border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)] overflow-hidden">
            {recentCampaigns.length > 0 ? (
              recentCampaigns.slice(0, 5).map((campaign) => (
                <CampaignRow key={campaign.id} campaign={campaign} />
              ))
            ) : (
              <div className="py-12 text-center">
                <Megaphone className="h-8 w-8 text-[var(--text-tertiary)] mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                  No campaigns yet
                </p>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  Create your first campaign to get started
                </p>
                <button onClick={() => navigate('/campaigns/new')} className="btn-primary">
                  <Plus className="h-4 w-4" />
                  Create Campaign
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Engagement metrics */}
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
            Engagement
          </h2>
          <div className="space-y-3">
            <MetricCard
              label="Open Rate"
              value={`${stats.avg_open_rate}%`}
              subtext={`${stats.total_opened.toLocaleString()} opened`}
            />
            <MetricCard
              label="Click Rate"
              value={`${stats.avg_click_rate}%`}
              subtext={`${stats.total_clicked.toLocaleString()} clicked`}
            />
            <MetricCard
              label="Reply Rate"
              value={`${stats.avg_reply_rate}%`}
              subtext={`${stats.total_replied.toLocaleString()} replies`}
            />
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-4 gap-3">
          <Link
            to="/campaigns/new"
            className="p-4 border border-[var(--border-subtle)] rounded-lg hover:border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors group"
          >
            <Megaphone className="h-5 w-5 text-[var(--text-tertiary)] mb-2 group-hover:text-[var(--text-secondary)]" strokeWidth={1.5} />
            <div className="text-sm font-medium text-[var(--text-primary)]">New Campaign</div>
            <div className="text-xs text-[var(--text-tertiary)]">Create email sequence</div>
          </Link>
          <Link
            to="/contacts"
            className="p-4 border border-[var(--border-subtle)] rounded-lg hover:border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors group"
          >
            <Users className="h-5 w-5 text-[var(--text-tertiary)] mb-2 group-hover:text-[var(--text-secondary)]" strokeWidth={1.5} />
            <div className="text-sm font-medium text-[var(--text-primary)]">Import Contacts</div>
            <div className="text-xs text-[var(--text-tertiary)]">Upload CSV file</div>
          </Link>
          <Link
            to="/smtp-accounts"
            className="p-4 border border-[var(--border-subtle)] rounded-lg hover:border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors group"
          >
            <Send className="h-5 w-5 text-[var(--text-tertiary)] mb-2 group-hover:text-[var(--text-secondary)]" strokeWidth={1.5} />
            <div className="text-sm font-medium text-[var(--text-primary)]">SMTP Setup</div>
            <div className="text-xs text-[var(--text-tertiary)]">Connect email</div>
          </Link>
          <Link
            to="/analytics"
            className="p-4 border border-[var(--border-subtle)] rounded-lg hover:border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors group"
          >
            <MousePointer className="h-5 w-5 text-[var(--text-tertiary)] mb-2 group-hover:text-[var(--text-secondary)]" strokeWidth={1.5} />
            <div className="text-sm font-medium text-[var(--text-primary)]">Analytics</div>
            <div className="text-xs text-[var(--text-tertiary)]">Track performance</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
