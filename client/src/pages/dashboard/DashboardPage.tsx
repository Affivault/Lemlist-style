import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analytics.api';
import { campaignsApi } from '../../api/campaigns.api';
import { Spinner } from '../../components/ui/Spinner';
import {
  Plus,
  ArrowRight,
  Megaphone,
  Users,
  Mail,
  BarChart3,
  TrendingUp,
  Zap,
  Play,
  Clock,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import type { Campaign } from '@lemlist/shared';

// Stat card with gradient background
function StatCard({
  icon: Icon,
  label,
  value,
  change,
  gradient,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  change?: number;
  gradient: string;
}) {
  return (
    <div className="relative rounded-2xl border border-subtle bg-surface p-5 overflow-hidden group hover:border-default transition-all">
      {/* Background gradient glow */}
      <div className={cn("absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity", gradient)} />

      <div className="relative">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", gradient.replace('bg-', 'bg-opacity-20 '))}>
          <Icon className={cn("h-5 w-5", gradient.replace('bg-', 'text-').replace('-500', '-400'))} />
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[13px] text-secondary mb-1">{label}</p>
            <p className="text-3xl font-bold text-primary">{value}</p>
          </div>
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-[12px] font-medium",
              change >= 0 ? "text-emerald-400" : "text-red-400"
            )}>
              <TrendingUp className={cn("h-3.5 w-3.5", change < 0 && "rotate-180")} />
              {Math.abs(change)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Campaign card
function CampaignCard({ campaign }: { campaign: Campaign }) {
  const navigate = useNavigate();

  const statusConfig = {
    draft: { color: 'text-tertiary', bg: 'bg-elevated', icon: Clock },
    active: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Play },
    paused: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Clock },
    completed: { color: 'text-violet-400', bg: 'bg-violet-500/10', icon: Check },
  };

  const status = statusConfig[campaign.status as keyof typeof statusConfig] || statusConfig.draft;
  const StatusIcon = status.icon;

  return (
    <button
      onClick={() => navigate(`/campaigns/${campaign.id}`)}
      className="flex flex-col p-5 rounded-xl border border-subtle bg-surface hover:border-default hover:bg-elevated/50 transition-all text-left group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-[15px] font-semibold text-primary group-hover:text-violet-400 transition-colors">
          {campaign.name}
        </h3>
        <ChevronRight className="h-4 w-4 text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium w-fit",
        status.bg, status.color
      )}>
        <StatusIcon className="h-3 w-3" />
        <span className="capitalize">{campaign.status}</span>
      </div>
    </button>
  );
}

// Quick action link
function QuickAction({
  icon: Icon,
  label,
  description,
  href,
  gradient,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  href: string;
  gradient: string;
}) {
  return (
    <Link
      to={href}
      className="flex items-center gap-4 p-4 rounded-xl border border-subtle bg-surface hover:border-default hover:bg-elevated/50 transition-all group"
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", gradient)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[14px] font-medium text-primary group-hover:text-violet-400 transition-colors">{label}</h4>
        <p className="text-[12px] text-secondary truncate">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-tertiary group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
    </Link>
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
    <div className="max-w-6xl space-y-8">
      {/* Welcome header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Welcome back</h1>
          <p className="text-secondary mt-1">Here's what's happening with your campaigns</p>
        </div>
        <button
          onClick={() => navigate('/campaigns/new')}
          className="btn-solid"
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Megaphone}
          label="Total Campaigns"
          value={stats.total_campaigns}
          change={12}
          gradient="bg-violet-500"
        />
        <StatCard
          icon={Users}
          label="Total Contacts"
          value={stats.total_contacts.toLocaleString()}
          change={8}
          gradient="bg-pink-500"
        />
        <StatCard
          icon={Mail}
          label="Emails Sent"
          value={stats.total_sent.toLocaleString()}
          change={24}
          gradient="bg-orange-500"
        />
        <StatCard
          icon={BarChart3}
          label="Open Rate"
          value={`${stats.avg_open_rate}%`}
          change={5}
          gradient="bg-emerald-500"
        />
      </div>

      {/* Two columns */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent campaigns */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Recent Campaigns</h2>
            <Link to="/campaigns" className="text-[13px] text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {recentCampaigns.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {recentCampaigns.slice(0, 4).map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-subtle">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
                <Megaphone className="h-6 w-6 text-violet-400" />
              </div>
              <h3 className="text-[15px] font-semibold text-primary mb-1">No campaigns yet</h3>
              <p className="text-[13px] text-secondary mb-4">Create your first campaign to get started</p>
              <button
                onClick={() => navigate('/campaigns/new')}
                className="btn-solid"
              >
                <Plus className="h-4 w-4" />
                Create Campaign
              </button>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-lg font-semibold text-primary mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <QuickAction
              icon={Plus}
              label="New Campaign"
              description="Create a new email sequence"
              href="/campaigns/new"
              gradient="bg-gradient-to-br from-violet-500 to-pink-500"
            />
            <QuickAction
              icon={Users}
              label="Import Contacts"
              description="Upload a CSV file"
              href="/contacts"
              gradient="bg-gradient-to-br from-pink-500 to-orange-500"
            />
            <QuickAction
              icon={Zap}
              label="SMTP Setup"
              description="Connect your email"
              href="/smtp-accounts"
              gradient="bg-gradient-to-br from-orange-500 to-amber-500"
            />
            <QuickAction
              icon={BarChart3}
              label="View Analytics"
              description="Track performance"
              href="/analytics"
              gradient="bg-gradient-to-br from-emerald-500 to-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Engagement metrics */}
      <div>
        <h2 className="text-lg font-semibold text-primary mb-4">Engagement Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border border-subtle bg-surface">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Mail className="h-4 w-4 text-violet-400" />
              </div>
              <span className="text-[13px] text-secondary">Open Rate</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-primary">{stats.avg_open_rate}%</span>
              <span className="text-[12px] text-emerald-400 mb-1">+2.3%</span>
            </div>
            <div className="mt-3 h-1.5 bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
                style={{ width: `${stats.avg_open_rate}%` }}
              />
            </div>
          </div>

          <div className="p-5 rounded-xl border border-subtle bg-surface">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-pink-400" />
              </div>
              <span className="text-[13px] text-secondary">Click Rate</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-primary">{stats.avg_click_rate}%</span>
              <span className="text-[12px] text-emerald-400 mb-1">+1.8%</span>
            </div>
            <div className="mt-3 h-1.5 bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-orange-500 rounded-full"
                style={{ width: `${Math.min(stats.avg_click_rate * 2, 100)}%` }}
              />
            </div>
          </div>

          <div className="p-5 rounded-xl border border-subtle bg-surface">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-orange-400" />
              </div>
              <span className="text-[13px] text-secondary">Reply Rate</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-primary">{stats.avg_reply_rate}%</span>
              <span className="text-[12px] text-emerald-400 mb-1">+3.1%</span>
            </div>
            <div className="mt-3 h-1.5 bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                style={{ width: `${Math.min(stats.avg_reply_rate * 3, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
