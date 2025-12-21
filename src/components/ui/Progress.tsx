'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Linear Progress Bar
const progressVariants = {
  primary: 'bg-primary-500',
  secondary: 'bg-secondary-500',
  accent: 'bg-accent-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  gradient: 'bg-gradient-to-r from-primary-500 via-accent-500 to-secondary-500',
} as const;

const trackVariants = {
  light: 'bg-stone-100',
  dark: 'bg-stone-200',
  transparent: 'bg-transparent',
} as const;

const sizes = {
  xs: 'h-1',
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
  xl: 'h-6',
} as const;

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: keyof typeof progressVariants;
  trackVariant?: keyof typeof trackVariants;
  size?: keyof typeof sizes;
  showValue?: boolean;
  valueFormat?: (value: number, max: number) => string;
  animated?: boolean;
  striped?: boolean;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      variant = 'primary',
      trackVariant = 'light',
      size = 'md',
      showValue = false,
      valueFormat = (v, m) => `${Math.round((v / m) * 100)}%`,
      animated = true,
      striped = false,
      className,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {showValue && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-stone-700">Progression</span>
            <span className="text-sm font-semibold text-stone-800">
              {valueFormat(value, max)}
            </span>
          </div>
        )}
        <div
          className={cn(
            'w-full rounded-full overflow-hidden',
            trackVariants[trackVariant],
            sizes[size]
          )}
        >
          <motion.div
            className={cn(
              'h-full rounded-full',
              progressVariants[variant],
              striped && 'bg-[length:1rem_1rem] bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)]'
            )}
            initial={animated ? { width: 0 } : false}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

// Circular Progress
export interface CircularProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: keyof typeof progressVariants;
  strokeWidth?: number;
  showValue?: boolean;
  valueFormat?: (value: number, max: number) => string;
  label?: string;
  animated?: boolean;
}

const circularSizes = {
  sm: 48,
  md: 64,
  lg: 96,
  xl: 128,
};

export const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(
  (
    {
      value,
      max = 100,
      size = 'md',
      variant = 'primary',
      strokeWidth = 4,
      showValue = true,
      valueFormat = (v, m) => `${Math.round((v / m) * 100)}%`,
      label,
      animated = true,
      className,
      ...props
    },
    ref
  ) => {
    const sizeValue = circularSizes[size];
    const radius = (sizeValue - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const offset = circumference - (percentage / 100) * circumference;

    const colorClasses: Record<string, string> = {
      primary: 'stroke-primary-500',
      secondary: 'stroke-secondary-500',
      accent: 'stroke-accent-500',
      success: 'stroke-green-500',
      warning: 'stroke-amber-500',
      danger: 'stroke-red-500',
    };

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex items-center justify-center', className)}
        style={{ width: sizeValue, height: sizeValue }}
        {...props}
      >
        <svg
          className="transform -rotate-90"
          width={sizeValue}
          height={sizeValue}
        >
          {/* Background circle */}
          <circle
            className="stroke-stone-100"
            strokeWidth={strokeWidth}
            fill="none"
            r={radius}
            cx={sizeValue / 2}
            cy={sizeValue / 2}
          />
          {/* Progress circle */}
          <motion.circle
            className={cn(colorClasses[variant] || 'stroke-primary-500')}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            r={radius}
            cx={sizeValue / 2}
            cy={sizeValue / 2}
            initial={animated ? { strokeDashoffset: circumference } : false}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              strokeDasharray: circumference,
            }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showValue && (
            <span
              className={cn(
                'font-bold text-stone-800',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-sm',
                size === 'lg' && 'text-base',
                size === 'xl' && 'text-xl'
              )}
            >
              {valueFormat(value, max)}
            </span>
          )}
          {label && (
            <span
              className={cn(
                'text-stone-500',
                size === 'sm' && 'text-[8px]',
                size === 'md' && 'text-[10px]',
                size === 'lg' && 'text-xs',
                size === 'xl' && 'text-sm'
              )}
            >
              {label}
            </span>
          )}
        </div>
      </div>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';

// Macro Progress - for displaying nutritional macros
export interface MacroProgressProps extends HTMLAttributes<HTMLDivElement> {
  current: number;
  target: number;
  label: string;
  color: 'protein' | 'carbs' | 'fat' | 'calories';
  unit?: string;
  showDetails?: boolean;
}

const macroColors = {
  protein: { bg: 'bg-blue-100', fill: 'bg-blue-500', text: 'text-blue-700' },
  carbs: { bg: 'bg-amber-100', fill: 'bg-amber-500', text: 'text-amber-700' },
  fat: { bg: 'bg-purple-100', fill: 'bg-purple-500', text: 'text-purple-700' },
  calories: { bg: 'bg-red-100', fill: 'bg-red-500', text: 'text-red-700' },
};

export const MacroProgress = forwardRef<HTMLDivElement, MacroProgressProps>(
  (
    { current, target, label, color, unit = 'g', showDetails = true, className, ...props },
    ref
  ) => {
    const percentage = Math.min((current / target) * 100, 100);
    const colors = macroColors[color];
    const remaining = Math.max(target - current, 0);

    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        <div className="flex justify-between items-center">
          <span className={cn('text-sm font-medium', colors.text)}>{label}</span>
          {showDetails && (
            <span className="text-xs text-stone-500">
              {current}/{target} {unit}
            </span>
          )}
        </div>
        <div className={cn('h-2.5 rounded-full overflow-hidden', colors.bg)}>
          <motion.div
            className={cn('h-full rounded-full', colors.fill)}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        {showDetails && (
          <p className="text-xs text-stone-400">
            {remaining > 0
              ? `Encore ${remaining} ${unit} à consommer`
              : `Objectif atteint ! 🎉`}
          </p>
        )}
      </div>
    );
  }
);

MacroProgress.displayName = 'MacroProgress';

export default Progress;
