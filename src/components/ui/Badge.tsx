'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-primary-100 text-primary-700 border-primary-200',
  secondary: 'bg-secondary-100 text-secondary-700 border-secondary-200',
  accent: 'bg-accent-100 text-accent-700 border-accent-200',
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  neutral: 'bg-stone-100 text-stone-700 border-stone-200',
  // Solid variants
  'primary-solid': 'bg-primary-500 text-white border-primary-600',
  'secondary-solid': 'bg-secondary-500 text-white border-secondary-600',
  'accent-solid': 'bg-accent-500 text-white border-accent-600',
} as const;

const sizes = {
  xs: 'px-1.5 py-0.5 text-[10px]',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
} as const;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  rounded?: boolean;
  dot?: boolean;
  dotColor?: string;
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'sm',
      rounded = true,
      dot = false,
      dotColor,
      icon,
      removable = false,
      onRemove,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 font-medium border',
          'transition-all duration-200',
          variants[variant],
          sizes[size],
          rounded ? 'rounded-full' : 'rounded-lg',
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn('w-1.5 h-1.5 rounded-full', dotColor || 'bg-current')}
          />
        )}
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 ml-0.5 hover:opacity-70 transition-opacity"
          >
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
              <path
                d="M3 3L9 9M9 3L3 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Macro Badge - for displaying nutritional values
export interface MacroBadgeProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: number;
  unit?: string;
  color: 'protein' | 'carbs' | 'fat' | 'calories' | 'fiber';
  compact?: boolean;
}

const macroColors = {
  protein: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  carbs: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  fat: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  calories: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  fiber: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
};

export const MacroBadge = forwardRef<HTMLDivElement, MacroBadgeProps>(
  ({ label, value, unit = 'g', color, compact = false, className, ...props }, ref) => {
    const colors = macroColors[color];

    if (compact) {
      return (
        <div
          ref={ref}
          className={cn(
            'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border',
            colors.bg,
            colors.text,
            colors.border,
            className
          )}
          {...props}
        >
          <span className="font-semibold">{value}</span>
          <span className="opacity-70">{unit}</span>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border',
          colors.bg,
          colors.border,
          className
        )}
        {...props}
      >
        <span className={cn('text-lg font-bold', colors.text)}>
          {value}
          <span className="text-xs font-normal ml-0.5">{unit}</span>
        </span>
        <span className="text-[10px] font-medium text-stone-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
    );
  }
);

MacroBadge.displayName = 'MacroBadge';

// Status Badge - for showing status with animation
export interface StatusBadgeProps extends BadgeProps {
  status: 'online' | 'offline' | 'busy' | 'away';
  pulse?: boolean;
}

const statusConfig = {
  online: { color: 'bg-green-500', label: 'En ligne' },
  offline: { color: 'bg-stone-400', label: 'Hors ligne' },
  busy: { color: 'bg-red-500', label: 'Occupé' },
  away: { color: 'bg-amber-500', label: 'Absent' },
};

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, pulse = true, className, ...props }, ref) => {
    const config = statusConfig[status];

    return (
      <Badge
        ref={ref}
        variant="neutral"
        className={className}
        {...props}
      >
        <span className="relative flex h-2 w-2">
          {pulse && status === 'online' && (
            <span className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              config.color
            )} />
          )}
          <span className={cn('relative inline-flex rounded-full h-2 w-2', config.color)} />
        </span>
        {config.label}
      </Badge>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

export default Badge;
