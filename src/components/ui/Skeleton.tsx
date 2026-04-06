import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-white/5',
        'before:absolute before:inset-0',
        'before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent',
        'before:animate-[shimmer_2s_infinite]',
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}
