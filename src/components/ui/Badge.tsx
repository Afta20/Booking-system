import { cn } from '@/lib/utils/cn';

type BadgeVariant = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'info' | 'room' | 'tool';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  pending: 'bg-accent-amber/15 text-accent-amber border-accent-amber/25',
  approved: 'bg-accent-green/15 text-accent-green border-accent-green/25',
  rejected: 'bg-accent-red/15 text-accent-red border-accent-red/25',
  cancelled: 'bg-text-muted/15 text-text-muted border-text-muted/25',
  info: 'bg-accent-blue/15 text-accent-blue border-accent-blue/25',
  room: 'bg-accent-purple/15 text-accent-purple border-accent-purple/25',
  tool: 'bg-accent-green/15 text-accent-green border-accent-green/25',
};

const dotColors: Record<BadgeVariant, string> = {
  pending: 'bg-accent-amber',
  approved: 'bg-accent-green',
  rejected: 'bg-accent-red',
  cancelled: 'bg-text-muted',
  info: 'bg-accent-blue',
  room: 'bg-accent-purple',
  tool: 'bg-accent-green',
};

export default function Badge({ children, variant = 'info', className, dot = false }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border',
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', dotColors[variant])} />
      )}
      {children}
    </span>
  );
}
