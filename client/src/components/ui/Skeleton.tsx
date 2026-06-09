import { cn } from '../../lib/utils';

/**
 * Skeleton — a shimmering placeholder block used while data loads.
 * Premium products show structure-aware skeletons instead of a spinner,
 * which makes loading feel instant and intentional.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-md', className)} />;
}

/** A horizontal row of skeleton text lines with decreasing widths. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        // last line is shorter for a natural paragraph rag
        <Skeleton key={i} className={cn('h-3', i === lines - 1 && 'w-2/3')} />
      ))}
    </div>
  );
}
