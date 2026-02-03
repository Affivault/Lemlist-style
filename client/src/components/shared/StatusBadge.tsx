import { cn } from '../../lib/utils';
import type { CampaignStatus, ContactCampaignStatus } from '@lemlist/shared';

const campaignColors: Record<string, string> = {
  draft: 'bg-white/5 text-secondary',
  scheduled: 'bg-blue-500/10 text-blue-400',
  running: 'bg-emerald-500/10 text-emerald-400',
  paused: 'bg-amber-500/10 text-amber-400',
  completed: 'bg-violet-500/10 text-violet-400',
  cancelled: 'bg-red-500/10 text-red-400',
};

const contactColors: Record<string, string> = {
  pending: 'bg-white/5 text-secondary',
  active: 'bg-emerald-500/10 text-emerald-400',
  completed: 'bg-violet-500/10 text-violet-400',
  replied: 'bg-blue-500/10 text-blue-400',
  bounced: 'bg-red-500/10 text-red-400',
  unsubscribed: 'bg-amber-500/10 text-amber-400',
  error: 'bg-red-500/10 text-red-400',
};

interface StatusBadgeProps {
  status: CampaignStatus | ContactCampaignStatus | string;
  type?: 'campaign' | 'contact';
}

export function StatusBadge({ status, type = 'campaign' }: StatusBadgeProps) {
  const colorMap = type === 'campaign' ? campaignColors : contactColors;
  const colors = colorMap[status] || 'bg-white/5 text-secondary';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        colors
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
