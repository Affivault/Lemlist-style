import { cn } from '../../lib/utils';
import type { CampaignStatus, ContactCampaignStatus } from '@lemlist/shared';

const campaignColors: Record<string, string> = {
  draft: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]',
  scheduled: 'bg-[var(--info-bg)] text-[var(--info)]',
  running: 'bg-[var(--success-bg)] text-[var(--success)]',
  paused: 'bg-[var(--warning-bg)] text-[var(--warning)]',
  completed: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]',
  cancelled: 'bg-[var(--error-bg)] text-[var(--error)]',
};

const contactColors: Record<string, string> = {
  pending: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]',
  active: 'bg-[var(--success-bg)] text-[var(--success)]',
  completed: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]',
  replied: 'bg-[var(--info-bg)] text-[var(--info)]',
  bounced: 'bg-[var(--error-bg)] text-[var(--error)]',
  unsubscribed: 'bg-[var(--warning-bg)] text-[var(--warning)]',
  error: 'bg-[var(--error-bg)] text-[var(--error)]',
};

interface StatusBadgeProps {
  status: CampaignStatus | ContactCampaignStatus | string;
  type?: 'campaign' | 'contact';
}

export function StatusBadge({ status, type = 'campaign' }: StatusBadgeProps) {
  const colorMap = type === 'campaign' ? campaignColors : contactColors;
  const colors = colorMap[status] || 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
        colors
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
