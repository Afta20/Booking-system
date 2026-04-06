'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'glass' | 'solid' | 'bordered' | 'glow';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

const variantStyles: Record<string, string> = {
  glass: 'glass-card',
  solid: 'bg-dark-800 border border-white/5',
  bordered: 'bg-transparent border border-white/10',
  glow: 'glass-card glow-border-blue',
};

const paddingStyles: Record<string, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

export default function Card({
  children,
  variant = 'glass',
  padding = 'md',
  hoverable = false,
  className,
  ...props
}: CardProps) {
  return (
    <motion.div
      whileHover={hoverable ? { scale: 1.01, y: -2 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'rounded-2xl overflow-hidden',
        variantStyles[variant],
        paddingStyles[padding],
        hoverable && 'cursor-pointer hover:border-white/15 transition-colors duration-300',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
