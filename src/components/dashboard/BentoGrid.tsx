'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export default function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoItemProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2;
  index?: number;
}

const colSpanClass: Record<number, string> = {
  1: 'col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-2 lg:col-span-3',
  4: 'md:col-span-2 lg:col-span-4',
};

const rowSpanClass: Record<number, string> = {
  1: 'row-span-1',
  2: 'row-span-2',
};

export function BentoItem({
  children,
  className,
  colSpan = 1,
  rowSpan = 1,
  index = 0,
}: BentoItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
      className={cn(
        colSpanClass[colSpan],
        rowSpanClass[rowSpan],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
