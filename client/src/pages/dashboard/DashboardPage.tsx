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
  ArrowUpRight,
  TrendingUp,
  Plus,
  FileText,
  UserPlus,
  ArrowRight,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

const gradients = [
  'from-indigo-500 to-indigo-600',
  'from-cyan-500 to-cyan-600',
  'from-violet-500 to-violet-600',
  'from-emerald-500 to-emerald-600',
];

const bgGradients = [
  'from-indigo-500/10 to-indigo-500/5',
  'from-cyan-500/10 to-cyan-500/5',
  'from-violet-500/10 to-violet-500/5',
  'from-emerald-500/10 to-emerald-500/5',
];

const iconColors = [
  'text-indigo-400',
  'text-cyan-400',
  'text-violet-400',
  'text-emerald-400',
];

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  index = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  trend?: number;
  index?: number;
}) {
  const colorIndex = index % 4;

  return (
    <div className="group relative overflow-hidden rounded-xl bg-slate-800/50 border border-slate-800 p-6 hover:border-slate-700 transition-all duration-300">
      {/* Decorative gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bgGradients[colorIndex]} rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-70 transition-opacity`} />

      <div className="relative flex items-start justify-between">
        <div>
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${bgGradients[colorIndex]} mb-4`}>
            <Icon className={`h-6 w-6 ${iconColors[colorIndex]}`} />
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {sub && <p className="text-sm text-slate-500 mt-1">{sub}</p>}
        </div>

        {trend !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${trend >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
}

function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
  gradient,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  gradient: string;
}) {
  return (
    <Link
      to={href}
      className="group relative overflow-hidden rounded-xl bg-slate-800/50 border border-slate-800 p-6 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

      <div className="relative flex items-start gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md shadow-indigo-500/10`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
            {title}
            <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-indigo-400" />
          </h3>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
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
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-sm text-slate-400">Loading your dashboard...</p>
        </div>
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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back! Here's your outreach performance at a glance.</p>
        </div>
        <Button
          onClick={() => navigate('/campaigns/new')}
          className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-500/30"
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Main Stats */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-400" />
          Performance Overview
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={BarChart3}
            label="Total Campaigns"
            value={stats.total_campaigns}
            sub={`${stats.active_campaigns} currently active`}
            trend={12}
            index={0}
          />
          <StatCard
            icon={Users}
            label="Total Contacts"
            value={stats.total_contacts.toLocaleString()}
            trend={8}
            index={1}
          />
          <StatCard
            icon={Send}
            label="Emails Sent"
            value={stats.total_sent.toLocaleString()}
            trend={24}
            index={2}
          />
          <StatCard
            icon={MessageSquare}
            label="Total Replies"
            value={stats.total_replied.toLocaleString()}
            trend={15}
            index={3}
          />
        </div>
      </div>

      {/* Engagement Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          Engagement Metrics
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-white shadow-xl shadow-indigo-500/20">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/20">
                  <Mail className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-indigo-100">Open Rate</span>
              </div>
              <p className="text-4xl font-bold mb-1">{stats.avg_open_rate}%</p>
              <p className="text-sm text-indigo-200">{stats.total_opened.toLocaleString()} total opens</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 p-6 text-white shadow-xl shadow-cyan-500/20">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/20">
                  <MousePointerClick className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-cyan-100">Click Rate</span>
              </div>
              <p className="text-4xl font-bold mb-1">{stats.avg_click_rate}%</p>
              <p className="text-sm text-cyan-200">{stats.total_clicked.toLocaleString()} total clicks</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 p-6 text-white shadow-xl shadow-violet-500/20">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/20">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-violet-100">Reply Rate</span>
              </div>
              <p className="text-4xl font-bold mb-1">{stats.avg_reply_rate}%</p>
              <p className="text-sm text-violet-200">{stats.total_replied.toLocaleString()} total replies</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-400" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            icon={Plus}
            title="Create Campaign"
            description="Start a new outreach campaign with custom sequences"
            href="/campaigns/new"
            gradient="from-indigo-500 to-indigo-600"
          />
          <QuickActionCard
            icon={UserPlus}
            title="Import Contacts"
            description="Add new leads from CSV or manually"
            href="/contacts"
            gradient="from-cyan-500 to-cyan-600"
          />
          <QuickActionCard
            icon={Mail}
            title="Connect SMTP"
            description="Set up your email sending infrastructure"
            href="/smtp-accounts"
            gradient="from-violet-500 to-violet-600"
          />
        </div>
      </div>
    </div>
  );
}
