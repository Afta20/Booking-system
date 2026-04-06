'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-accent-blue/20 text-accent-blue border border-accent-blue/30 hover:bg-accent-blue/30 hover:border-accent-blue/50 hover:shadow-[0_0_20px_rgba(0,212,255,0.2)]',
  secondary:
    'bg-white/5 text-text-primary border border-white/10 hover:bg-white/10 hover:border-white/20',
  ghost:
    'bg-transparent text-text-secondary border border-transparent hover:bg-white/5 hover:text-text-primary',
  danger:
    'bg-accent-red/20 text-accent-red border border-accent-red/30 hover:bg-accent-red/30 hover:border-accent-red/50',
  success:
    'bg-accent-green/20 text-accent-green border border-accent-green/30 hover:bg-accent-green/30 hover:border-accent-green/50',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      disabled={disabled || isLoading}
      className={cn(
        'relative inline-flex items-center justify-center rounded-xl font-medium',
        'transition-all duration-200 cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        'backdrop-blur-sm',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {!isLoading && icon && <span className="shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
}
