import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]',
    success: 'bg-[var(--success-bg)] text-[var(--success)] border border-[var(--success-border)]',
    warning: 'bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning-border)]',
    danger: 'bg-[var(--error-bg)] text-[var(--error)] border border-[var(--error-border)]',
    info: 'bg-[var(--info-bg)] text-[var(--info)] border border-[var(--info-border)]',
    brand: 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-default)]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-150',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
