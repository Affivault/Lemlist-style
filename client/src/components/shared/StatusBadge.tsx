import { cn } from '../../lib/utils';
import type { CampaignStatus, ContactCampaignStatus } from '@lemlist/shared';

const campaignColors: Record<string, string> = {
  draft: 'bg-slate-700/50 text-slate-400',
  scheduled: 'bg-blue-500/10 text-blue-400',
  running: 'bg-emerald-500/10 text-emerald-400',
  paused: 'bg-amber-500/10 text-amber-400',
  completed: 'bg-indigo-500/10 text-indigo-400',
  cancelled: 'bg-red-500/10 text-red-400',
};

const contactColors: Record<string, string> = {
  pending: 'bg-slate-700/50 text-slate-400',
  active: 'bg-emerald-500/10 text-emerald-400',
  completed: 'bg-indigo-500/10 text-indigo-400',
  replied: 'bg-violet-500/10 text-violet-400',
  bounced: 'bg-red-500/10 text-red-400',
  unsubscribed: 'bg-orange-500/10 text-orange-400',
  error: 'bg-red-500/10 text-red-400',
};

interface StatusBadgeProps {
  status: CampaignStatus | ContactCampaignStatus | string;
  type?: 'campaign' | 'contact';
}

export function StatusBadge({ status, type = 'campaign' }: StatusBadgeProps) {
  const colorMap = type === 'campaign' ? campaignColors : contactColors;
  const colors = colorMap[status] || 'bg-slate-700/50 text-slate-400';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        colors
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
