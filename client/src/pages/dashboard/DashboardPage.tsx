import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analytics.api';
import { campaignsApi } from '../../api/campaigns.api';
import { Spinner } from '../../components/ui/Spinner';
import {
  Plus,
  Check,
  UserPlus,
  ChevronRight,
  Megaphone,
  Users,
  Mail,
  BarChart3,
  Play,
  Pause,
  Clock,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import type { Campaign } from '@lemlist/shared';

// Campaign card - Render style
function CampaignCard({ campaign }: { campaign: Campaign }) {
  const navigate = useNavigate();

  const statusConfig = {
    draft: { color: 'text-tertiary', label: 'Draft', icon: Clock },
    active: { color: 'text-brand', label: 'All services running', icon: Check },
    paused: { color: 'text-amber-600', label: 'Paused', icon: Pause },
    completed: { color: 'text-secondary', label: 'Completed', icon: Check },
  };

  const status = statusConfig[campaign.status as keyof typeof statusConfig] || statusConfig.draft;
  const StatusIcon = status.icon;

  return (
    <button
      onClick={() => navigate(`/campaigns/${campaign.id}`)}
      className="flex flex-col p-5 border border-subtle rounded-lg hover:border-default transition-colors text-left group"
    >
      <h3 className="text-[15px] font-semibold text-primary mb-3">
        {campaign.name}
      </h3>
      <div className={cn(
        "inline-flex items-center gap-1.5 text-[13px] font-medium",
        status.color
      )}>
        <StatusIcon className="h-3.5 w-3.5" />
        <span>{status.label}</span>
      </div>
    </button>
  );
}

// Create new card - Render style with dashed border
function CreateNewCard({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 p-5 border border-dashed border-subtle rounded-lg hover:border-default hover:bg-hover/50 transition-colors text-secondary hover:text-primary"
    >
      <Plus className="h-4 w-4" />
      <span className="text-[14px] font-medium">{label}</span>
    </button>
  );
}

// Quick action item - Render style
function QuickAction({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | number;
  href: string;
}) {
  return (
    <Link
      to={href}
      className="flex items-center justify-between py-3.5 border-b border-subtle last:border-0 group"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-secondary" strokeWidth={1.75} />
        <span className="text-[13px] text-secondary group-hover:text-primary transition-colors">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-[13px] font-medium text-tertiary">{value}</span>}
        <ChevronRight className="h-4 w-4 text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
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
    <div className="max-w-5xl">
      {/* Header - Render style */}
      <div className="flex items-start justify-between mb-10">
        <h1 className="text-[32px] font-semibold text-primary">Overview</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 text-[13px] font-medium text-brand hover:text-brand-600 transition-colors">
            <UserPlus className="h-4 w-4" />
            Invite your team
          </button>
          <button
            onClick={() => navigate('/campaigns/new')}
            className="flex items-center gap-1.5 h-9 px-4 text-[13px] font-medium bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            <Plus className="h-4 w-4" />
            New
          </button>
        </div>
      </div>

      {/* Campaigns Section - Render style */}
      <section className="mb-10">
        <h2 className="text-[15px] font-semibold text-primary mb-4">Campaigns</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentCampaigns.slice(0, 2).map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
          <CreateNewCard
            onClick={() => navigate('/campaigns/new')}
            label="Create new campaign"
          />
        </div>
      </section>

      {/* Quick Stats - Render style minimal cards */}
      <section className="mb-10">
        <h2 className="text-[15px] font-semibold text-primary mb-4">Quick Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 border border-subtle rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Megaphone className="h-4 w-4 text-secondary" strokeWidth={1.75} />
              <span className="text-[13px] text-secondary">Campaigns</span>
            </div>
            <p className="text-[24px] font-semibold text-primary">{stats.total_campaigns}</p>
            <p className="text-[12px] text-tertiary mt-1">{stats.active_campaigns} active</p>
          </div>

          <div className="p-5 border border-subtle rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-secondary" strokeWidth={1.75} />
              <span className="text-[13px] text-secondary">Contacts</span>
            </div>
            <p className="text-[24px] font-semibold text-primary">{stats.total_contacts.toLocaleString()}</p>
          </div>

          <div className="p-5 border border-subtle rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="h-4 w-4 text-secondary" strokeWidth={1.75} />
              <span className="text-[13px] text-secondary">Emails Sent</span>
            </div>
            <p className="text-[24px] font-semibold text-primary">{stats.total_sent.toLocaleString()}</p>
          </div>

          <div className="p-5 border border-subtle rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-secondary" strokeWidth={1.75} />
              <span className="text-[13px] text-secondary">Open Rate</span>
            </div>
            <p className="text-[24px] font-semibold text-primary">{stats.avg_open_rate}%</p>
          </div>
        </div>
      </section>

      {/* Quick Actions - Render style list */}
      <section>
        <h2 className="text-[15px] font-semibold text-primary mb-4">Quick Actions</h2>
        <div className="border border-subtle rounded-lg px-5">
          <QuickAction
            icon={Plus}
            label="Create a new campaign"
            href="/campaigns/new"
          />
          <QuickAction
            icon={UserPlus}
            label="Import contacts"
            value={`${stats.total_contacts} total`}
            href="/contacts"
          />
          <QuickAction
            icon={Mail}
            label="Connect SMTP account"
            href="/smtp-accounts"
          />
          <QuickAction
            icon={BarChart3}
            label="View analytics"
            value={`${stats.total_sent} sent`}
            href="/analytics"
          />
        </div>
      </section>
    </div>
  );
}
