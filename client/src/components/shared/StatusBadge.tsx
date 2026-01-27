import { Badge } from '../ui/Badge';
import type { CampaignStatus, ContactCampaignStatus } from '@lemlist/shared';

const campaignVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'> = {
  draft: 'default',
  scheduled: 'info',
  running: 'success',
  paused: 'warning',
  completed: 'purple',
  cancelled: 'danger',
};

const contactVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'> = {
  pending: 'default',
  active: 'info',
  completed: 'success',
  replied: 'purple',
  bounced: 'danger',
  unsubscribed: 'warning',
  error: 'danger',
};

interface StatusBadgeProps {
  status: CampaignStatus | ContactCampaignStatus | string;
  type?: 'campaign' | 'contact';
}

export function StatusBadge({ status, type = 'campaign' }: StatusBadgeProps) {
  const variants = type === 'campaign' ? campaignVariants : contactVariants;
  const variant = variants[status] || 'default';

  return (
    <Badge variant={variant}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
