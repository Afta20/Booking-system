'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  accentColor?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
}

const accentStyles = {
  blue: {
    iconBg: 'bg-accent-blue/10',
    iconColor: 'text-accent-blue',
    glow: 'group-hover:shadow-[0_0_30px_rgba(0,212,255,0.1)]',
    trendPositive: 'text-accent-green',
    trendNegative: 'text-accent-red',
  },
  green: {
    iconBg: 'bg-accent-green/10',
    iconColor: 'text-accent-green',
    glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]',
    trendPositive: 'text-accent-green',
    trendNegative: 'text-accent-red',
  },
  amber: {
    iconBg: 'bg-accent-amber/10',
    iconColor: 'text-accent-amber',
    glow: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]',
    trendPositive: 'text-accent-green',
    trendNegative: 'text-accent-red',
  },
  red: {
    iconBg: 'bg-accent-red/10',
    iconColor: 'text-accent-red',
    glow: 'group-hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]',
    trendPositive: 'text-accent-green',
    trendNegative: 'text-accent-red',
  },
  purple: {
    iconBg: 'bg-accent-purple/10',
    iconColor: 'text-accent-purple',
    glow: 'group-hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]',
    trendPositive: 'text-accent-green',
    trendNegative: 'text-accent-red',
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'blue',
}: StatCardProps) {
  const styles = accentStyles[accentColor];

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'group glass-card rounded-2xl p-5 cursor-default transition-all duration-300',
        styles.glow
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-2.5 rounded-xl', styles.iconBg)}>
          <Icon size={20} className={styles.iconColor} />
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium font-mono',
              trend.positive ? styles.trendPositive : styles.trendNegative
            )}
          >
            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      <p className="text-3xl font-bold text-text-primary font-mono tracking-tight">{value}</p>
      <p className="text-sm text-text-secondary mt-1">{title}</p>
      {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
    </motion.div>
  );
}
